
-- Ensure pgcrypto is available (hmac/digest)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Store the HMAC secret in Supabase Vault (create if missing; never returned)
DO $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM vault.secrets WHERE name = 'auth_rate_limit_hmac_key'
  ) INTO v_exists;

  IF NOT v_exists THEN
    PERFORM vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'auth_rate_limit_hmac_key',
      'HMAC key for auth resend rate-limit identifier hashing'
    );
  END IF;
END $$;

-- 2) Drop old bytea-based RPC and revoke privileges
REVOKE ALL ON FUNCTION public.consume_auth_resend_attempt(bytea, bytea) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION IF EXISTS public.consume_auth_resend_attempt(bytea, bytea);

-- 3) New text-input RPC — hashing done inside Postgres using Vault secret
CREATE OR REPLACE FUNCTION public.consume_auth_resend_attempt(_email text, _ip text)
RETURNS TABLE(allowed boolean, retry_after_seconds integer, config_ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_key           text;
  v_email_norm    text;
  v_email_hash    bytea;
  v_ip_hash       bytea;
  email_lock_key  bigint;
  ip_lock_key     bigint;
  last_email_at   timestamptz;
  email_hour      int;
  ip_hour         int;
  wait_secs       int;
BEGIN
  -- Read Vault secret; fail closed if missing/empty.
  SELECT decrypted_secret INTO v_key
    FROM vault.decrypted_secrets
   WHERE name = 'auth_rate_limit_hmac_key'
   LIMIT 1;

  IF v_key IS NULL OR length(v_key) < 32 THEN
    RETURN QUERY SELECT false, 0, false;
    RETURN;
  END IF;

  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RETURN QUERY SELECT false, 0, true;
    RETURN;
  END IF;

  v_email_norm := lower(trim(_email));

  -- HMAC-SHA256 done in-DB; raw email/IP never persisted.
  v_email_hash := extensions.hmac('email:' || v_email_norm, v_key, 'sha256');
  IF _ip IS NOT NULL AND length(trim(_ip)) > 0 THEN
    v_ip_hash := extensions.hmac('ip:' || trim(_ip), v_key, 'sha256');
  END IF;

  -- Deterministic advisory-lock keys derived from the hashes.
  email_lock_key := ('x' || substr(encode(extensions.digest(v_email_hash, 'sha256'), 'hex'), 1, 15))::bit(60)::bigint;
  IF v_ip_hash IS NOT NULL THEN
    ip_lock_key := ('x' || substr(encode(extensions.digest(v_ip_hash, 'sha256'), 'hex'), 1, 15))::bit(60)::bigint;
  END IF;

  -- Ordered lock acquisition to prevent deadlocks and IP-bypass races.
  IF ip_lock_key IS NULL THEN
    PERFORM pg_advisory_xact_lock(email_lock_key);
  ELSIF email_lock_key <= ip_lock_key THEN
    PERFORM pg_advisory_xact_lock(email_lock_key);
    PERFORM pg_advisory_xact_lock(ip_lock_key);
  ELSE
    PERFORM pg_advisory_xact_lock(ip_lock_key);
    PERFORM pg_advisory_xact_lock(email_lock_key);
  END IF;

  -- Inline retention cleanup (>24h).
  DELETE FROM public.auth_resend_attempts WHERE created_at < now() - interval '24 hours';

  -- 60s per-email cooldown.
  SELECT MAX(created_at) INTO last_email_at
    FROM public.auth_resend_attempts
   WHERE email_hash = v_email_hash;
  IF last_email_at IS NOT NULL AND last_email_at > now() - interval '60 seconds' THEN
    wait_secs := GREATEST(1, 60 - EXTRACT(EPOCH FROM (now() - last_email_at))::int);
    RETURN QUERY SELECT false, wait_secs, true;
    RETURN;
  END IF;

  -- 5 per hour per email.
  SELECT count(*) INTO email_hour
    FROM public.auth_resend_attempts
   WHERE email_hash = v_email_hash
     AND created_at > now() - interval '1 hour';
  IF email_hour >= 5 THEN
    RETURN QUERY SELECT false, 3600, true;
    RETURN;
  END IF;

  -- 20 per hour per IP.
  IF v_ip_hash IS NOT NULL THEN
    SELECT count(*) INTO ip_hour
      FROM public.auth_resend_attempts
     WHERE ip_hash = v_ip_hash
       AND created_at > now() - interval '1 hour';
    IF ip_hour >= 20 THEN
      RETURN QUERY SELECT false, 3600, true;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.auth_resend_attempts (email_hash, ip_hash) VALUES (v_email_hash, v_ip_hash);
  RETURN QUERY SELECT true, 0, true;
END;
$function$;

-- 4) Service-role-only execution
REVOKE ALL ON FUNCTION public.consume_auth_resend_attempt(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_resend_attempt(text, text) TO service_role;
