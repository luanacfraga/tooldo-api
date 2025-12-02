import { Team, UpdateTeamData } from '@/core/domain/team/team.entity';

export interface TeamRepository {
  create(team: Team, tx?: unknown): Promise<Team>;
  findById(id: string, tx?: unknown): Promise<Team | null>;
  findByCompanyId(companyId: string, tx?: unknown): Promise<Team[]>;
  update(
    id: string,
    data: Partial<UpdateTeamData>,
    tx?: unknown,
  ): Promise<Team>;
  delete(id: string, tx?: unknown): Promise<void>;
}
