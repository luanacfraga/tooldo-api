import { CompanyApplicationModule } from '@/application/modules/company.module';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';

@Module({
  imports: [CompanyApplicationModule],
  controllers: [CompanyController],
})
export class CompanyModule {}
