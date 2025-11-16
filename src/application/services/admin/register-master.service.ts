import { UserFactory } from '@/application/factories/user.factory';
import { DocumentType } from '@/core/domain/shared/enums';
import { UniqueConstraintException } from '@/core/domain/shared/exceptions/domain.exception';
import { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { Inject, Injectable } from '@nestjs/common';

export interface RegisterMasterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  document: string;
  documentType: DocumentType;
}

export interface RegisterMasterOutput {
  user: User;
}

@Injectable()
export class RegisterMasterService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
    private readonly userFactory: UserFactory,
  ) {}

  async execute(input: RegisterMasterInput): Promise<RegisterMasterOutput> {
    await this.validateUniqueConstraints(input);

    const userId = this.idGenerator.generate();
    const hashedPassword = await this.passwordHasher.hash(input.password);

    return await this.transactionManager.execute(async (tx) => {
      const user = this.userFactory.createMaster({
        id: userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        document: input.document,
        documentType: input.documentType,
        hashedPassword,
        profileImageUrl: null,
      });
      const createdUser = await this.userRepository.create(user, tx);

      return {
        user: createdUser,
      };
    });
  }

  private async validateUniqueConstraints(
    input: RegisterMasterInput,
  ): Promise<void> {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new UniqueConstraintException('Email', input.email);
    }

    const existingPhone = await this.userRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw new UniqueConstraintException('Telefone', input.phone);
    }

    const existingDocument = await this.userRepository.findByDocument(
      input.document,
    );
    if (existingDocument) {
      throw new UniqueConstraintException('Documento', input.document);
    }
  }
}
