import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
export class NodemailerEmailService implements EmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail =
      process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? 'noreply@tooldo.com';
    this.fromName = process.env.EMAIL_FROM_NAME ?? 'ToolDo';

    const emailProvider = process.env.EMAIL_PROVIDER ?? 'smtp';

    if (emailProvider === 'aws-ses') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'email-smtp.us-east-1.amazonaws.com',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        ...(process.env.SMTP_REQUIRE_TLS === 'true' && {
          requireTLS: true,
        }),
      });
    }

    // Verificar configuração na inicialização
    void this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service configured successfully');
    } catch (error) {
      this.logger.error(
        '❌ Email service configuration error:',
        error instanceof Error ? error.message : String(error),
      );
      this.logger.warn(
        '⚠️  Emails will not be sent until SMTP configuration is correct',
      );
    }
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
    const { html } = await renderEmail({ react });
    const text = getEmployeeInvitePlainText(templateParams);
    const subject = `Convite para ${params.companyName} - ToolDo`;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: params.to,
        subject,
        html,
        text,
      });

      this.logger.log(`✅ Email sent: Employee Invite to ${params.to}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email to ${params.to}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
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
    const subject = `${params.employeeName} aceitou o convite - ${params.companyName}`;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: params.to,
        subject,
        html,
        text,
      });

      this.logger.log(
        `✅ Email sent: Employee Invite Accepted to ${params.to}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email to ${params.to}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const templateParams = {
      userName: params.userName,
      resetLink: this.buildResetLink(params.resetToken),
    };

    const react = PasswordResetEmail(templateParams);
    const { html } = await renderEmail({ react });
    const text = getPasswordResetPlainText(templateParams);
    const subject = 'Recuperação de Senha - ToolDo';

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: params.to,
        subject,
        html,
        text,
      });

      this.logger.log(`✅ Email sent: Password Reset to ${params.to}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email to ${params.to}:`,
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
