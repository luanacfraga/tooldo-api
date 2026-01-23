import { EmployeeInviteAcceptedListener } from '@/application/events/listeners/employee-invite-accepted.listener';
import { AcceptInviteService } from '@/application/services/employee/accept-invite.service';
import { ActivateEmployeeService } from '@/application/services/employee/activate-employee.service';
import { ChangeEmployeeRoleService } from '@/application/services/employee/change-employee-role.service';
import { InviteEmployeeService } from '@/application/services/employee/invite-employee.service';
import { ListEmployeesService } from '@/application/services/employee/list-employees.service';
import { ListExecutorsService } from '@/application/services/employee/list-executors.service';
import { RemoveEmployeeService } from '@/application/services/employee/remove-employee.service';
import { RemoveEmployeeWithTransferService } from '@/application/services/employee/remove-employee-with-transfer.service';
import { ResendInviteService } from '@/application/services/employee/resend-invite.service';
import { SuspendEmployeeService } from '@/application/services/employee/suspend-employee.service';
import { UpdateEmployeeService } from '@/application/services/employee/update-employee.service';
import { ValidatePlanLimitsService } from '@/application/services/employee/validate-plan-limits.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [DatabaseModule, SharedServicesModule, EventEmitterModule.forRoot()],
  providers: [
    ValidatePlanLimitsService,
    InviteEmployeeService,
    AcceptInviteService,
    ListEmployeesService,
    ListExecutorsService,
    SuspendEmployeeService,
    ActivateEmployeeService,
    RemoveEmployeeService,
    RemoveEmployeeWithTransferService,
    ResendInviteService,
    ChangeEmployeeRoleService,
    UpdateEmployeeService,
    EmployeeInviteAcceptedListener,
  ],
  exports: [
    ValidatePlanLimitsService,
    InviteEmployeeService,
    AcceptInviteService,
    ListEmployeesService,
    ListExecutorsService,
    SuspendEmployeeService,
    ActivateEmployeeService,
    RemoveEmployeeService,
    RemoveEmployeeWithTransferService,
    ResendInviteService,
    ChangeEmployeeRoleService,
    UpdateEmployeeService,
  ],
})
export class EmployeeApplicationModule {}
