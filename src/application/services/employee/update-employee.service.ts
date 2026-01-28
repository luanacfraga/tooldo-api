import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import {
  DomainValidationException,
  EntityNotFoundException,
  UniqueConstraintException,
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
  email?: string;
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

    if (companyUser.isRemoved()) {
      throw new DomainValidationException(
        'Não é possível editar um funcionário removido',
      );
    }

    const user = await this.userRepository.findById(companyUser.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuário', companyUser.userId);
    }

    const userUpdateData: Record<string, unknown> = {};
    if (input.firstName !== undefined) {
      userUpdateData.firstName = input.firstName;
    }
    if (input.lastName !== undefined) {
      userUpdateData.lastName = input.lastName;
    }
    if (input.email !== undefined) {
      if (!companyUser.isInvited()) {
        throw new DomainValidationException(
          'O email não pode ser alterado para funcionários ativos',
        );
      }

      if (!input.email || input.email.trim() === '') {
        throw new DomainValidationException('O email não pode ser vazio');
      }

      const trimmedEmail = input.email.trim().toLowerCase();

      if (trimmedEmail !== user.email.toLowerCase()) {
        const existingUser =
          await this.userRepository.findByEmail(trimmedEmail);
        if (existingUser && existingUser.id !== user.id) {
          throw new UniqueConstraintException('Email', trimmedEmail);
        }
        userUpdateData.email = trimmedEmail;
      }
    }
    if (input.phone !== undefined) {
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
