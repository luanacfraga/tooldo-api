import { CompanyApplicationModule } from '@/application/modules/company.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';

@Module({
  imports: [CompanyApplicationModule, DatabaseModule],
  controllers: [CompanyController],
})
export class CompanyModule {}
