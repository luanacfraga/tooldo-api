import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListExecutorsInput {
  companyId: string;
  excludeTeamId?: string;
}

export interface ListExecutorsOutput {
  executors: CompanyUser[];
}

@Injectable()
export class ListExecutorsService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  async execute(input: ListExecutorsInput): Promise<ListExecutorsOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    const allCompanyUsers =
      await this.companyUserRepository.findByCompanyIdAndStatus(
        input.companyId,
        CompanyUserStatus.ACTIVE,
      );

    const executors = allCompanyUsers.filter(
      (cu) => cu.role === UserRole.EXECUTOR,
    );

    if (executors.length === 0) {
      return { executors: [] };
    }

    const executorUserIds = executors.map((e) => e.userId);

    const allTeamUsers = await Promise.all(
      executorUserIds.map((userId) =>
        this.teamUserRepository.findByUserId(userId),
      ),
    );

    const executorsInTeamsMap = new Map<string, string>();
    allTeamUsers.forEach((teamUser, index) => {
      if (teamUser) {
        executorsInTeamsMap.set(executorUserIds[index], teamUser.teamId);
      }
    });

    if (!input.excludeTeamId) {
      const availableExecutors = executors.filter(
        (executor) => !executorsInTeamsMap.has(executor.userId),
      );

      return { executors: availableExecutors };
    }

    const availableExecutors = executors.filter((executor) => {
      const teamId = executorsInTeamsMap.get(executor.userId);

      if (!teamId) {
        return true;
      }

      return teamId === input.excludeTeamId;
    });

    return { executors: availableExecutors };
  }
}
