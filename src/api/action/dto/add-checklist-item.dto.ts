import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddChecklistItemDto {
  @ApiProperty({
    description: 'Descrição do item da checklist',
    example: 'Revisar código',
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description!: string;

  @ApiProperty({
    description: 'Ordem do item na lista',
    example: 0,
    minimum: 0,
  })
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(0, { message: 'A ordem deve ser maior ou igual a 0' })
  order!: number;
}
