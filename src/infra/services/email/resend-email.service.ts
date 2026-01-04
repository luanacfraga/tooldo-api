import type {
  EmailService,
  SendEmployeeInviteAcceptedParams,
  SendEmployeeInviteParams,
  SendPasswordResetParams,
} from '@/core/ports/services/email-service.port';
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
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
export class ResendEmailService implements EmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is required when using ResendEmailService',
      );
    }

    const fromEmail = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
    const fromName = process.env.EMAIL_FROM_NAME ?? 'Tooldo';
    this.from = `"${fromName}" <${fromEmail}>`;

    this.resend = new Resend(apiKey);
  }

  async sendEmployeeInvite(params: SendEmployeeInviteParams): Promise<void> {
    const templateParams: EmployeeInviteTemplateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      inviteLink: this.buildInviteLink(params.inviteToken),
      inviterName: params.inviterName,
      role: params.role,
    };

    const html = getEmployeeInviteTemplate(templateParams);
    const subject = `Convite para ${params.companyName} - Tooldo`;

    await this.send({
      to: params.to,
      subject,
      html,
      logLabel: `Employee Invite to ${params.to}`,
    });
  }

  async sendEmployeeInviteAccepted(
    params: SendEmployeeInviteAcceptedParams,
  ): Promise<void> {
    const templateParams: EmployeeInviteAcceptedTemplateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      adminName: params.adminName,
    };

    const html = getEmployeeInviteAcceptedTemplate(templateParams);
    const subject = `${params.employeeName} aceitou o convite - ${params.companyName}`;

    await this.send({
      to: params.to,
      subject,
      html,
      logLabel: `Employee Invite Accepted to ${params.to}`,
    });
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const templateParams: PasswordResetTemplateParams = {
      userName: params.userName,
      resetLink: this.buildResetLink(params.resetToken),
    };

    const html = getPasswordResetTemplate(templateParams);
    const subject = 'Recuperação de Senha - Tooldo';

    await this.send({
      to: params.to,
      subject,
      html,
      logLabel: `Password Reset to ${params.to}`,
    });
  }

  private async send(input: {
    to: string;
    subject: string;
    html: string;
    logLabel: string;
  }): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      if (result.error) {
        this.logger.error(
          `❌ Resend error (${input.logLabel}): ${result.error.message}`,
        );
        throw new Error(result.error.message);
      }

      this.logger.log(`✅ Email sent (Resend): ${input.logLabel}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email via Resend (${input.logLabel}):`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
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
