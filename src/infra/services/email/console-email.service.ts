import type {
  EmailService,
  SendEmployeeInviteAcceptedParams,
  SendEmployeeInviteParams,
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
    this.logger.log(`Subject: Convite para ${params.companyName} - Weedu`);
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

  private buildInviteLink(token: string): string {
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    return `${baseUrl}/accept-invite?token=${token}`;
  }
}
