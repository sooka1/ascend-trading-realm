export type { EmailService, SendEmailResult, SendTemplateEmailOptions } from "./email/types";
export type { AIService, AIMessage, AIGenerateOptions } from "./ai/types";
export type {
  AuthService,
  OAuthProvider,
  OAuthSignInOptions,
  OAuthSignInResult,
} from "./auth/types";
export type { PushService } from "./push/types";

// Default (Lovable) adapters — swap these lines to migrate.
export { lovableEmailService as emailService } from "./email/lovable-adapter";
export { lovableAIService as aiService } from "./ai/lovable-adapter";
export { lovableAuthService as authService } from "./auth/lovable-adapter";
export { nativePushService as pushService } from "./push/lovable-adapter";