-- Private rate-limit table for verification-email resend attempts.
CREATE TABLE public.auth_resend_attempts (
  id           bigserial PRIMARY KEY,
  email_hash   bytea NOT NULL,
  ip_hash      bytea,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_are_email_hash_time ON public.auth_resend_attempts (email_hash, created_at DESC);
CREATE INDEX idx_are_ip_hash_time    ON public.auth_resend_attempts (ip_hash,    created_at DESC)
  WHERE ip_hash IS NOT NULL;
CREATE INDEX idx_are_created_at      ON public.auth_resend_attempts (created_at);

-- Server-only. No GRANTs to anon or authenticated.
GRANT ALL ON public.auth_resend_attempts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.auth_resend_attempts_id_seq TO service_role;

ALTER TABLE public.auth_resend_attempts ENABLE ROW LEVEL SECURITY;
-- Intentionally NO policies; all non-service_role access denied.

-- Atomic consumer with inline retention.
CREATE OR REPLACE FUNCTION public.consume_auth_resend_attempt(
  _email_hash bytea,
  _ip_hash    bytea
) RETURNS TABLE(allowed boolean, retry_after_seconds int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_lock_key bigint;
  ip_lock_key    bigint;
  first_key      bigint;
  second_key     bigint;
  last_email_at  timestamptz;
  email_hour     int;
  ip_hour        int;
  wait_secs      int;
BEGIN
  -- Deterministic lock keys.
  email_lock_key := ('x' || substr(encode(digest(_email_hash, 'sha256'), 'hex'), 1, 15))::bit(60)::bigint;
  IF _ip_hash IS NOT NULL THEN
    ip_lock_key := ('x' || substr(encode(digest(_ip_hash, 'sha256'), 'hex'), 1, 15))::bit(60)::bigint;
  END IF;

  -- Consistent lock order to prevent deadlocks and IP-bypass via concurrent
  -- requests with different emails from the same IP.
  IF ip_lock_key IS NULL THEN
    PERFORM pg_advisory_xact_lock(email_lock_key);
  ELSIF email_lock_key <= ip_lock_key THEN
    PERFORM pg_advisory_xact_lock(email_lock_key);
    PERFORM pg_advisory_xact_lock(ip_lock_key);
  ELSE
    PERFORM pg_advisory_xact_lock(ip_lock_key);
    PERFORM pg_advisory_xact_lock(email_lock_key);
  END IF;

  -- Inline retention: prune rows older than 24 hours before checks.
  DELETE FROM public.auth_resend_attempts WHERE created_at < now() - interval '24 hours';

  -- 60s per-email cooldown.
  SELECT MAX(created_at) INTO last_email_at
  FROM public.auth_resend_attempts
  WHERE email_hash = _email_hash;

  IF last_email_at IS NOT NULL AND last_email_at > now() - interval '60 seconds' THEN
    wait_secs := GREATEST(1, 60 - EXTRACT(EPOCH FROM (now() - last_email_at))::int);
    RETURN QUERY SELECT false, wait_secs; RETURN;
  END IF;

  -- 5 per hour per email.
  SELECT count(*) INTO email_hour
  FROM public.auth_resend_attempts
  WHERE email_hash = _email_hash AND created_at > now() - interval '1 hour';
  IF email_hour >= 5 THEN
    RETURN QUERY SELECT false, 3600; RETURN;
  END IF;

  -- 20 per hour per IP.
  IF _ip_hash IS NOT NULL THEN
    SELECT count(*) INTO ip_hour
    FROM public.auth_resend_attempts
    WHERE ip_hash = _ip_hash AND created_at > now() - interval '1 hour';
    IF ip_hour >= 20 THEN
      RETURN QUERY SELECT false, 3600; RETURN;
    END IF;
  END IF;

  INSERT INTO public.auth_resend_attempts (email_hash, ip_hash) VALUES (_email_hash, _ip_hash);
  RETURN QUERY SELECT true, 0;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_auth_resend_attempt(bytea, bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_auth_resend_attempt(bytea, bytea) FROM anon;
REVOKE ALL ON FUNCTION public.consume_auth_resend_attempt(bytea, bytea) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_resend_attempt(bytea, bytea) TO service_role;