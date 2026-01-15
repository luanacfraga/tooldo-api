import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { User } from '@/core/domain/user/user.entity';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

import { UserRole } from '@/core/domain/shared/enums';

export interface UpdateEmployeeInput {
  companyUserId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  document?: string;
  position?: string;
  notes?: string;
  role?: UserRole;
}

export interface UpdateEmployeeOutput {
  companyUser: CompanyUser;
  user: User;
}

@Injectable()
export class UpdateEmployeeService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateEmployeeInput): Promise<UpdateEmployeeOutput> {
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Funcionário', input.companyUserId);
    }

    // Permite edição mesmo quando está em fase de convite
    // Apenas valida se não foi removido
    if (companyUser.isRemoved()) {
      throw new DomainValidationException(
        'Não é possível editar um funcionário removido',
      );
    }

    const user = await this.userRepository.findById(companyUser.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuário', companyUser.userId);
    }

    // Atualiza dados do usuário
    // Usamos um objeto solto para não violar os campos readonly da entidade de domínio
    const userUpdateData: Record<string, unknown> = {};
    if (input.firstName !== undefined) {
      userUpdateData.firstName = input.firstName;
    }
    if (input.lastName !== undefined) {
      userUpdateData.lastName = input.lastName;
    }
    if (input.phone !== undefined) {
      // Remove valores temporários (temp_${userId}) ou strings vazias
      if (
        !input.phone ||
        input.phone.trim() === '' ||
        input.phone.startsWith('temp_')
      ) {
        userUpdateData.phone = null;
      } else {
        userUpdateData.phone = input.phone.trim();
      }
    }
    if (input.document !== undefined) {
      // Remove valores temporários (temp_${userId}) ou strings vazias
      if (
        !input.document ||
        input.document.trim() === '' ||
        input.document.startsWith('temp_')
      ) {
        userUpdateData.document = null;
      } else {
        userUpdateData.document = input.document.trim();
      }
    }

    const updatedUser = await this.userRepository.update(
      user.id,
      userUpdateData as Partial<User>,
    );

    // Atualiza dados do vínculo empresa-usuário
    // Usamos um objeto solto para não violar os campos readonly da entidade de domínio
    const companyUserUpdateData: Record<string, unknown> = {};
    if (input.position !== undefined) {
      companyUserUpdateData.position = input.position || null;
    }
    if (input.notes !== undefined) {
      companyUserUpdateData.notes = input.notes || null;
    }
    if (input.role !== undefined) {
      companyUserUpdateData.role = input.role;
    }

    const updatedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      companyUserUpdateData as Partial<CompanyUser>,
    );

    return {
      companyUser: updatedCompanyUser,
      user: updatedUser,
    };
  }
}
