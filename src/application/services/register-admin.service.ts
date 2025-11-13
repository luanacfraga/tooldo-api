import { Company } from '@/core/domain/company.entity';
import { DocumentType } from '@/core/domain/enums';
import {
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/exceptions/domain.exception';
import { Subscription } from '@/core/domain/subscription.entity';
import { User } from '@/core/domain/user.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface RegisterAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  document: string;
  documentType: DocumentType;
  company: {
    name: string;
    description?: string;
  };
}

export interface RegisterAdminOutput {
  user: User;
  company: Company;
  subscription: Subscription;
}

@Injectable()
export class RegisterAdminService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: RegisterAdminInput): Promise<RegisterAdminOutput> {
    // Validações fora da transação (não modificam dados)
    await this.validateUniqueConstraints(input);
    const defaultPlan = await this.findDefaultPlan();

    // Gerar IDs fora da transação
    const userId = this.idGenerator.generate();
    const companyId = this.idGenerator.generate();
    const subscriptionId = this.idGenerator.generate();

    // Hash de senha fora da transação
    const hashedPassword = await this.passwordHasher.hash(input.password);

    // Executar criações dentro de uma transação atômica
    return await this.transactionManager.execute(async (tx) => {
      // Criar usuário
      const user = User.createAdmin(
        userId,
        input.firstName,
        input.lastName,
        input.email,
        input.phone,
        input.document,
        input.documentType,
        hashedPassword,
        null,
      );
      const createdUser = await this.userRepository.create(user, tx);

      // Criar empresa
      const company = new Company(
        companyId,
        input.company.name,
        input.company.description ?? null,
        userId,
      );
      const createdCompany = await this.companyRepository.create(company, tx);

      // Criar assinatura
      const subscription = Subscription.create(
        subscriptionId,
        userId,
        defaultPlan.id,
      );
      const createdSubscription = await this.subscriptionRepository.create(
        subscription,
        tx,
      );

      return {
        user: createdUser,
        company: createdCompany,
        subscription: createdSubscription,
      };
    });
  }

  private async validateUniqueConstraints(
    input: RegisterAdminInput,
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

  private async findDefaultPlan() {
    const defaultPlan = await this.planRepository.findByName('default');
    if (!defaultPlan) {
      throw new EntityNotFoundException(ErrorMessages.PLAN.DEFAULT_NOT_FOUND);
    }
    return defaultPlan;
  }
}
