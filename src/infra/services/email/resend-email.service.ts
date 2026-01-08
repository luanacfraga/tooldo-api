import { Injectable, Logger } from '@nestjs/common';
import type * as React from 'react';
import { Resend } from 'resend';

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
    const fromName = process.env.EMAIL_FROM_NAME ?? 'ToolDo';
    this.from = `"${fromName}" <${fromEmail}>`;

    this.resend = new Resend(apiKey);
  }

  async sendEmployeeInvite(params: SendEmployeeInviteParams): Promise<void> {
    const templateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      inviteLink: this.buildInviteLink(params.inviteToken),
      inviterName: params.inviterName,
      role: params.role,
    };

    const react = EmployeeInviteEmail(templateParams);
    const text = getEmployeeInvitePlainText(templateParams);
    const subject = `Convite para ${params.companyName} - ToolDo`;

    await this.send({
      to: params.to,
      subject,
      react,
      text,
      logLabel: `Employee Invite to ${params.to}`,
    });
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
    const text = getEmployeeInviteAcceptedPlainText(templateParams);
    const subject = `${params.employeeName} aceitou o convite - ${params.companyName}`;

    await this.send({
      to: params.to,
      subject,
      react,
      text,
      logLabel: `Employee Invite Accepted to ${params.to}`,
    });
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const templateParams = {
      userName: params.userName,
      resetLink: this.buildResetLink(params.resetToken),
    };

    const react = PasswordResetEmail(templateParams);
    const text = getPasswordResetPlainText(templateParams);
    const subject = 'Recuperação de Senha - ToolDo';

    await this.send({
      to: params.to,
      subject,
      react,
      text,
      logLabel: `Password Reset to ${params.to}`,
    });
  }

  private async send(input: {
    to: string;
    subject: string;
    react: React.ReactElement;
    text: string;
    logLabel: string;
  }): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to: input.to,
        subject: input.subject,
        react: input.react,
        text: input.text,
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
