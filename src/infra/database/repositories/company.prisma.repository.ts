import { Company } from '@/core/domain/company.entity';
import type { CompanyRepository } from '@/core/ports/company.repository';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Company as PrismaCompany } from '@prisma/client';

@Injectable()
export class CompanyPrismaRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(company: Omit<Company, 'id'>): Promise<Company> {
    const created = await this.prisma.company.create({
      data: {
        name: company.name,
        description: company.description,
        adminId: company.adminId,
      },
    });

    return this.mapToDomain(created);
  }

  private mapToDomain(prismaCompany: PrismaCompany): Company {
    return new Company(
      prismaCompany.id,
      prismaCompany.name,
      prismaCompany.description,
      prismaCompany.adminId,
    );
  }
}
