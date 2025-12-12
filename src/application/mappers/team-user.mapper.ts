import { TeamUser } from '@/core/domain/team-user/team-user.entity';

export interface TeamUserResponseDto {
  id: string;
  teamId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TeamUserMapper {
  static toResponseDto(teamUser: TeamUser): TeamUserResponseDto {
    return {
      id: teamUser.id,
      teamId: teamUser.teamId,
      userId: teamUser.userId,
    };
  }
}
