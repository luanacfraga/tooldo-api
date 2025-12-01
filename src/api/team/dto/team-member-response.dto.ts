import { TeamUserMapper } from '@/application/mappers/team-user.mapper';
import { TeamUser } from '@/core/domain/team-user/team-user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  teamId!: string;

  @ApiProperty()
  userId!: string;

  static fromDomain(teamUser: TeamUser): TeamMemberResponseDto {
    return TeamUserMapper.toResponseDto(teamUser) as TeamMemberResponseDto;
  }
}
