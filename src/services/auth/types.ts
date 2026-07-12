export type OAuthProvider = "google" | "apple" | "microsoft" | "lovable";

export interface OAuthSignInOptions {
  redirectUri?: string;
  extraParams?: Record<string, string>;
}

export interface OAuthSignInResult {
  error?: Error;
  redirected?: boolean;
}

export interface AuthService {
  signInWithOAuth(
    provider: OAuthProvider,
    options?: OAuthSignInOptions,
  ): Promise<OAuthSignInResult>;
}