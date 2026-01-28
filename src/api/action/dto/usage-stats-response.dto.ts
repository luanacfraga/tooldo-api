import { ApiProperty } from '@nestjs/swagger';
import type { UsageStats } from '@/application/services/ia-usage/ia-usage.service';

export class UsageStatsResponseDto {
  @ApiProperty({
    description: 'Quantidade de chamadas de IA já utilizadas',
    example: 45,
  })
  used!: number;

  @ApiProperty({
    description: 'Limite total de chamadas de IA do plano',
    example: 100,
  })
  limit!: number;

  @ApiProperty({
    description: 'Quantidade de chamadas restantes',
    example: 55,
  })
  remaining!: number;

  static fromDomain(stats: UsageStats): UsageStatsResponseDto {
    const response = new UsageStatsResponseDto();
    response.used = stats.used;
    response.limit = stats.limit;
    response.remaining = stats.remaining;
    return response;
  }
}
