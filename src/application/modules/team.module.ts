import { EmployeeApplicationModule } from '@/application/modules/employee.module';
import { AddTeamMemberService } from '@/application/services/team/add-team-member.service';
import { CreateTeamService } from '@/application/services/team/create-team.service';
import { DeleteTeamService } from '@/application/services/team/delete-team.service';
import { ListAvailableExecutorsForTeamService } from '@/application/services/team/list-available-executors.service';
import { ListTeamMembersService } from '@/application/services/team/list-team-members.service';
import { ListTeamsByManagerService } from '@/application/services/team/list-teams-by-manager.service';
import { ListTeamsService } from '@/application/services/team/list-teams.service';
import { RemoveTeamMemberService } from '@/application/services/team/remove-team-member.service';
import { UpdateTeamService } from '@/application/services/team/update-team.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule, EmployeeApplicationModule],
  providers: [
    CreateTeamService,
    UpdateTeamService,
    DeleteTeamService,
    ListTeamsService,
    ListTeamsByManagerService,
    AddTeamMemberService,
    RemoveTeamMemberService,
    ListTeamMembersService,
    ListAvailableExecutorsForTeamService,
  ],
  exports: [
    CreateTeamService,
    UpdateTeamService,
    DeleteTeamService,
    ListTeamsService,
    ListTeamsByManagerService,
    AddTeamMemberService,
    RemoveTeamMemberService,
    ListTeamMembersService,
    ListAvailableExecutorsForTeamService,
  ],
})
export class TeamApplicationModule {}
