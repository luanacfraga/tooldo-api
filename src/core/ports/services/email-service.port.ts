export interface EmailService {
  sendEmployeeInvite(params: SendEmployeeInviteParams): Promise<void>;
  sendEmployeeInviteAccepted(
    params: SendEmployeeInviteAcceptedParams,
  ): Promise<void>;
  sendPasswordReset(params: SendPasswordResetParams): Promise<void>;
}

export interface SendEmployeeInviteParams {
  to: string;
  employeeName: string;
  companyName: string;
  inviteToken: string;
  inviterName: string;
  role: string;
}

export interface SendEmployeeInviteAcceptedParams {
  to: string;
  employeeName: string;
  companyName: string;
  adminName: string;
}

export interface SendPasswordResetParams {
  to: string;
  userName: string;
  resetToken: string;
}
