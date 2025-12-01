import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddTeamMemberDto {
  @ApiProperty({
    description: 'ID do usuário executor a ser adicionado à equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O userId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O userId é obrigatório' })
  userId!: string;
}
