import { Team } from '@/core/domain/team/team.entity';

export interface TeamResponseDto {
  id: string;
  name: string;
  description?: string | null;
  iaContext?: string | null;
  companyId: string;
  managerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TeamMapper {
  static toResponseDto(team: Team): TeamResponseDto {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      iaContext: team.iaContext,
      companyId: team.companyId,
      managerId: team.managerId,
    };
  }
}
