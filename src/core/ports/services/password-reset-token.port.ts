export interface PasswordResetTokenService {
  generateResetToken(payload: PasswordResetTokenPayload): string;
  verifyResetToken(token: string): PasswordResetTokenPayload;
}

export interface PasswordResetTokenPayload {
  userId: string;
  email: string;
}
