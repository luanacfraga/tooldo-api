import { TeamUser } from '@/core/domain/team-user/team-user.entity';

export interface TeamUserRepository {
  create(teamUser: TeamUser, tx?: unknown): Promise<TeamUser>;
  findById(id: string, tx?: unknown): Promise<TeamUser | null>;
  findByTeamId(teamId: string, tx?: unknown): Promise<TeamUser[]>;
  findByTeamAndUser(
    teamId: string,
    userId: string,
    tx?: unknown,
  ): Promise<TeamUser | null>;
  delete(id: string, tx?: unknown): Promise<void>;
}
