import type {
  EmailService,
  SendEmployeeInviteAcceptedParams,
  SendEmployeeInviteParams,
  SendPasswordResetParams,
} from '@/core/ports/services/email-service.port';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
export class NodemailerEmailService implements EmailService {
  private readonly logger = new Logger(NodemailerEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail =
      process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? 'noreply@tooldo.com';
    this.fromName = process.env.EMAIL_FROM_NAME ?? 'Tooldo';

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
    const templateParams: EmployeeInviteTemplateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      inviteLink: this.buildInviteLink(params.inviteToken),
      inviterName: params.inviterName,
      role: params.role,
    };

    const html = getEmployeeInviteTemplate(templateParams);
    const subject = `Convite para ${params.companyName} - Tooldo`;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: params.to,
        subject,
        html,
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
    const templateParams: EmployeeInviteAcceptedTemplateParams = {
      employeeName: params.employeeName,
      companyName: params.companyName,
      adminName: params.adminName,
    };

    const html = getEmployeeInviteAcceptedTemplate(templateParams);
    const subject = `${params.employeeName} aceitou o convite - ${params.companyName}`;

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: params.to,
        subject,
        html,
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
    const templateParams: PasswordResetTemplateParams = {
      userName: params.userName,
      resetLink: this.buildResetLink(params.resetToken),
    };

    const html = getPasswordResetTemplate(templateParams);
    const subject = 'Recuperação de Senha - Tooldo';

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: params.to,
        subject,
        html,
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
