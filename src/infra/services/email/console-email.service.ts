import { Injectable, Logger } from '@nestjs/common';

import type {
  EmailService,
  SendEmployeeInviteAcceptedParams,
  SendEmployeeInviteParams,
  SendPasswordResetParams,
} from '@/core/ports/services/email-service.port';
import {
  EmployeeInviteAcceptedEmail,
  getEmployeeInviteAcceptedPlainText,
} from './react-templates/employee-invite-accepted.email';
import {
  EmployeeInviteEmail,
  getEmployeeInvitePlainText,
} from './react-templates/employee-invite.email';
import {
  PasswordResetEmail,
  getPasswordResetPlainText,
} from './react-templates/password-reset.email';
import { renderEmail } from './react-templates/render-email';

@Injectable()
export class ConsoleEmailService implements EmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async sendEmployeeInvite(params: SendEmployeeInviteParams): Promise<void> {
    const templateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      inviteLink: this.buildInviteLink(params.inviteToken),
      inviterName: params.inviterName,
      role: params.role,
    };

    const react = EmployeeInviteEmail(templateParams);
    const { html } = await renderEmail({ react });
    const text = getEmployeeInvitePlainText(templateParams);

    this.logger.log('📧 [EMAIL] Employee Invite ');
    this.logger.log(`To: ${params.to}`);
    this.logger.log(`Subject: Convite para ${params.companyName} - ToolDo`);
    this.logger.log(`Invite Link: ${templateParams.inviteLink}`);
    this.logger.log(`Token: ${params.inviteToken}`);
    this.logger.log(`Text:\n${text}`);
    this.logger.log('---');

    void html;

    return;
  }

  async sendEmployeeInviteAccepted(
    params: SendEmployeeInviteAcceptedParams,
  ): Promise<void> {
    const templateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      adminName: params.adminName,
    };

    const react = EmployeeInviteAcceptedEmail(templateParams);
    const { html } = await renderEmail({ react });
    const text = getEmployeeInviteAcceptedPlainText(templateParams);

    this.logger.log('📧 [EMAIL] Employee Invite Accepted');
    this.logger.log(`To: ${params.to}`);
    this.logger.log(
      `Subject: ${params.employeeName} aceitou o convite - ${params.companyName}`,
    );
    this.logger.log(`Text:\n${text}`);
    this.logger.log('---');

    void html;

    return;
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const templateParams = {
      userName: params.userName,
      resetLink: this.buildResetLink(params.resetToken),
    };

    const react = PasswordResetEmail(templateParams);
    const { html } = await renderEmail({ react });
    const text = getPasswordResetPlainText(templateParams);

    this.logger.log('📧 [EMAIL] Password Reset');
    this.logger.log(`To: ${params.to}`);
    this.logger.log(`Subject: Recuperação de Senha - ToolDo`);
    this.logger.log(`Reset Link: ${templateParams.resetLink}`);
    this.logger.log(`Token: ${params.resetToken}`);
    this.logger.log(`Text:\n${text}`);
    this.logger.log('---');

    void html;

    return;
  }

  private buildInviteLink(token: string): string {
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    return `${baseUrl}/accept-invite?token=${token}`;
  }

  private buildResetLink(token: string): string {
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    return `${baseUrl}/reset-password?token=${token}`;
  }
}
