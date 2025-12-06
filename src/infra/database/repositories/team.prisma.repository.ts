import { Team, UpdateTeamData } from '@/core/domain/team/team.entity';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Team as PrismaTeam } from '@prisma/client';

@Injectable()
export class TeamPrismaRepository implements TeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(team: Team, tx?: unknown): Promise<Team> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.team.create({
      data: {
        id: team.id,
        name: team.name,
        description: team.description,
        iaContext: team.iaContext,
        companyId: team.companyId,
        managerId: team.managerId,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string, tx?: unknown): Promise<Team | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const team = await client.team.findUnique({
      where: { id },
    });

    return team ? this.mapToDomain(team) : null;
  }

  async findByCompanyId(companyId: string, tx?: unknown): Promise<Team[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const teams = await client.team.findMany({
      where: { companyId },
    });

    return teams.map((team) => this.mapToDomain(team));
  }

  async findByManagerId(managerId: string, tx?: unknown): Promise<Team[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const teams = await client.team.findMany({
      where: { managerId },
    });

    return teams.map((team) => this.mapToDomain(team));
  }

  async update(
    id: string,
    data: Partial<UpdateTeamData>,
    tx?: unknown,
  ): Promise<Team> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.team.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        iaContext: data.iaContext,
        managerId: data.managerId,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.team.delete({
      where: { id },
    });
  }

  private mapToDomain(prismaTeam: PrismaTeam): Team {
    return new Team(
      prismaTeam.id,
      prismaTeam.name,
      prismaTeam.description,
      prismaTeam.iaContext,
      prismaTeam.companyId,
      prismaTeam.managerId,
    );
  }
}
