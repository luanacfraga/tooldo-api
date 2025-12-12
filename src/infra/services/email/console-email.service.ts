import type {
  EmailService,
  SendEmployeeInviteAcceptedParams,
  SendEmployeeInviteParams,
  SendPasswordResetParams,
} from '@/core/ports/services/email-service.port';
import { Injectable, Logger } from '@nestjs/common';
import {
  getEmployeeInviteAcceptedTemplate,
  type EmployeeInviteAcceptedTemplateParams,
} from './templates/employee-invite-accepted.template';
import {
  getEmployeeInviteTemplate,
  type EmployeeInviteTemplateParams,
} from './templates/employee-invite.template';
import {
  getPasswordResetTemplate,
  type PasswordResetTemplateParams,
} from './templates/password-reset.template';

@Injectable()
export class ConsoleEmailService implements EmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  sendEmployeeInvite(params: SendEmployeeInviteParams): Promise<void> {
    const templateParams: EmployeeInviteTemplateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      inviteLink: this.buildInviteLink(params.inviteToken),
      inviterName: params.inviterName,
      role: params.role,
    };

    const html = getEmployeeInviteTemplate(templateParams);

    this.logger.log('📧 [EMAIL] Employee Invite');
    this.logger.log(`To: ${params.to}`);
    this.logger.log(`Subject: Convite para ${params.companyName} - Tooldo`);
    this.logger.log(`Invite Link: ${templateParams.inviteLink}`);
    this.logger.log(`Token: ${params.inviteToken}`);
    this.logger.log('---');

    void html;

    return Promise.resolve();
  }

  sendEmployeeInviteAccepted(
    params: SendEmployeeInviteAcceptedParams,
  ): Promise<void> {
    const templateParams: EmployeeInviteAcceptedTemplateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      adminName: params.adminName,
    };

    const html = getEmployeeInviteAcceptedTemplate(templateParams);

    this.logger.log('📧 [EMAIL] Employee Invite Accepted');
    this.logger.log(`To: ${params.to}`);
    this.logger.log(
      `Subject: ${params.employeeName} aceitou o convite - ${params.companyName}`,
    );
    this.logger.log('---');

    void html;

    return Promise.resolve();
  }

  sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const templateParams: PasswordResetTemplateParams = {
      userName: params.userName,
      resetLink: this.buildResetLink(params.resetToken),
    };

    const html = getPasswordResetTemplate(templateParams);

    this.logger.log('📧 [EMAIL] Password Reset');
    this.logger.log(`To: ${params.to}`);
    this.logger.log(`Subject: Recuperação de Senha - Tooldo`);
    this.logger.log(`Reset Link: ${templateParams.resetLink}`);
    this.logger.log(`Token: ${params.resetToken}`);
    this.logger.log('---');

    void html;

    return Promise.resolve();
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
