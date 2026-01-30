import {
  Company,
  UpdateCompanyData,
} from '@/core/domain/company/company.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Company as PrismaCompany } from '@prisma/client';

@Injectable()
export class CompanyPrismaRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(company: Company, tx?: unknown): Promise<Company> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.company.create({
      data: {
        id: company.id,
        name: company.name,
        description: company.description,
        adminId: company.adminId,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string, tx?: unknown): Promise<Company | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const company = await client.company.findUnique({
      where: { id },
    });

    return company ? this.mapToDomain(company) : null;
  }

  async findByAdminId(adminId: string, tx?: unknown): Promise<Company[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companies = await client.company.findMany({
      where: { adminId },
    });

    return companies.map((company) => this.mapToDomain(company));
  }

  async findAll(tx?: unknown): Promise<Company[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companies = await client.company.findMany({
      orderBy: { name: 'asc' },
    });
    return companies.map((company) => this.mapToDomain(company));
  }

  async countByAdminId(adminId: string): Promise<number> {
    return this.prisma.company.count({
      where: {
        adminId,
      },
    });
  }

  async update(
    id: string,
    data: Partial<UpdateCompanyData>,
    tx?: unknown,
  ): Promise<Company> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.company.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.company.delete({
      where: { id },
    });
  }

  private mapToDomain(prismaCompany: PrismaCompany): Company {
    return Company.create({
      id: prismaCompany.id,
      name: prismaCompany.name,
      description: prismaCompany.description,
      adminId: prismaCompany.adminId,
    });
  }
}
