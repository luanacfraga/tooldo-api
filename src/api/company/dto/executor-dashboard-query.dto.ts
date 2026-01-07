import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExecutorDashboardQueryDto {
  @ApiProperty({
    description: 'Data inicial do período (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsString({ message: 'dateFrom deve ser string ISO' })
  @IsNotEmpty({ message: 'dateFrom é obrigatório' })
  dateFrom!: string;

  @ApiProperty({
    description: 'Data final do período (ISO 8601)',
    example: '2026-01-07T23:59:59.999Z',
  })
  @IsString({ message: 'dateTo deve ser string ISO' })
  @IsNotEmpty({ message: 'dateTo é obrigatório' })
  dateTo!: string;
}


