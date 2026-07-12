export interface PushService {
  initialize(): Promise<void>;
  registerCurrentUser(): Promise<void>;
  revokeCurrentUser(): Promise<void>;
}