import { EmployeeApplicationModule } from '@/application/modules/employee.module';
import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [EmployeeApplicationModule],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
