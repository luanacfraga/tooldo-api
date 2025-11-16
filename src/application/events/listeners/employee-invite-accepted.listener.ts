import { EmployeeInviteAcceptedEvent } from '@/core/domain/events/employee.events';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { EmailService } from '@/core/ports/services/email-service.port';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EmployeeInviteAcceptedListener {
  private readonly logger = new Logger(EmployeeInviteAcceptedListener.name);

  constructor(
    @Inject('EmailService')
    private readonly emailService: EmailService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  @OnEvent('employee.invite.accepted')
  async handleEmployeeInviteAccepted(
    event: EmployeeInviteAcceptedEvent,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing employee invite accepted event for user ${event.userId}`,
      );

      // Get user and company info
      const [user, company] = await Promise.all([
        this.userRepository.findById(event.userId),
        this.companyRepository.findById(event.companyId),
      ]);

      if (!user || !company) {
        this.logger.warn(`User or company not found for invite accepted event`);
        return;
      }

      // Get admin info
      const admin = await this.userRepository.findById(company.adminId);
      if (!admin) {
        this.logger.warn(`Admin not found for company ${company.id}`);
        return;
      }

      // Send notification email to admin
      await this.emailService.sendEmployeeInviteAccepted({
        to: admin.email,
        employeeName: `${user.firstName} ${user.lastName}`,
        companyName: company.name,
        adminName: `${admin.firstName} ${admin.lastName}`,
      });

      this.logger.log(
        `Sent invite accepted notification to admin ${admin.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process employee invite accepted event: ${error}`,
      );
      // Don't throw error - we don't want to fail the main flow
    }
  }
}
