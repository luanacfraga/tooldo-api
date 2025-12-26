import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BlockActionDto {
  @ApiProperty({
    description: 'Motivo do bloqueio da ação',
    example: 'Aguardando aprovação do orçamento',
  })
  @IsString({ message: 'O motivo deve ser uma string' })
  @IsNotEmpty({ message: 'O motivo do bloqueio é obrigatório' })
  reason!: string;
}
