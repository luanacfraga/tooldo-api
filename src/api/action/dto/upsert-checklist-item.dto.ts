import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertChecklistItemDto {
  @ApiProperty({
    description: 'Descrição do item da checklist',
    example: 'Revisar código',
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description!: string;

  @ApiProperty({
    description: 'Indica se o item já está concluído',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'O status de conclusão deve ser um booleano' })
  isCompleted?: boolean;

  @ApiProperty({
    description:
      'Ordem do item na lista (0-based). Se não informado, será calculada pela ordem do array.',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(0, { message: 'A ordem deve ser maior ou igual a 0' })
  order?: number;
}
