import { lovable } from "@/integrations/lovable";
import type {
  AuthService,
  OAuthProvider,
  OAuthSignInOptions,
} from "./types";

export const lovableAuthService: AuthService = {
  async signInWithOAuth(provider: OAuthProvider, options?: OAuthSignInOptions) {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: options?.redirectUri,
      extraParams: options?.extraParams,
    });
    return {
      error: result.error instanceof Error ? result.error : undefined,
      redirected: (result as { redirected?: boolean }).redirected,
    };
  },
};