import { TeamMapper } from '@/application/mappers/team.mapper';
import { Team } from '@/core/domain/team/team.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  iaContext?: string | null;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  managerId!: string;

  static fromDomain(team: Team): TeamResponseDto {
    return TeamMapper.toResponseDto(team) as TeamResponseDto;
  }
}
