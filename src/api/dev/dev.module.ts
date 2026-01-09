import { DevDatabaseCleanupService } from '@/api/dev/dev-database-cleanup.service';
import { DevController } from '@/api/dev/dev.controller';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  providers: [DevDatabaseCleanupService],
  controllers: [DevController],
})
export class DevModule {}
