import { TeamUser } from '@/core/domain/team-user/team-user.entity';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TeamUser as PrismaTeamUser } from '@prisma/client';

@Injectable()
export class TeamUserPrismaRepository implements TeamUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(teamUser: TeamUser, tx?: unknown): Promise<TeamUser> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.teamUser.create({
      data: {
        id: teamUser.id,
        teamId: teamUser.teamId,
        userId: teamUser.userId,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string, tx?: unknown): Promise<TeamUser | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const teamUser = await client.teamUser.findUnique({
      where: { id },
    });

    return teamUser ? this.mapToDomain(teamUser) : null;
  }

  async findByTeamId(teamId: string, tx?: unknown): Promise<TeamUser[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const teamUsers = await client.teamUser.findMany({
      where: { teamId },
    });

    return teamUsers.map((teamUser) => this.mapToDomain(teamUser));
  }

  async findByUserId(userId: string, tx?: unknown): Promise<TeamUser | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const teamUser = await client.teamUser.findFirst({
      where: { userId },
    });

    return teamUser ? this.mapToDomain(teamUser) : null;
  }

  async findByTeamAndUser(
    teamId: string,
    userId: string,
    tx?: unknown,
  ): Promise<TeamUser | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const teamUser = await client.teamUser.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    return teamUser ? this.mapToDomain(teamUser) : null;
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.teamUser.delete({
      where: { id },
    });
  }

  private mapToDomain(prismaTeamUser: PrismaTeamUser): TeamUser {
    return new TeamUser(
      prismaTeamUser.id,
      prismaTeamUser.teamId,
      prismaTeamUser.userId,
    );
  }
}

