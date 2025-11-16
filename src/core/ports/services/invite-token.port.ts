export interface InviteTokenService {
  generateInviteToken(payload: InviteTokenPayload): string;
  verifyInviteToken(token: string): InviteTokenPayload;
}

export interface InviteTokenPayload {
  companyUserId: string;
  companyId: string;
  userId: string;
  email: string;
  role: string;
}
