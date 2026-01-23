import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RemoveEmployeeWithTransferDto {
  @ApiProperty({
    description:
      'ID do novo responsável que receberá as ações pendentes do funcionário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'O ID do novo responsável é obrigatório' })
  @IsUUID('4', { message: 'O ID do novo responsável deve ser um UUID válido' })
  newResponsibleId!: string;
}
