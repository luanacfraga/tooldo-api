import { ApiProperty } from '@nestjs/swagger';
import { ActionStatus } from '@/core/domain/shared/enums';

export class ActionTransferredDto {
  @ApiProperty({
    description: 'ID da ação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Título da ação',
    example: 'Implementar autenticação',
  })
  title!: string;

  @ApiProperty({
    description: 'Status da ação',
    enum: ActionStatus,
    example: ActionStatus.TODO,
  })
  status!: ActionStatus;
}

export class UserSummaryDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name!: string;
}

export class RemoveEmployeeWithTransferResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem-sucedida',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem descritiva do resultado',
    example: 'Colaborador removido com sucesso',
  })
  message!: string;

  @ApiProperty({
    description: 'Resumo da operação realizada',
  })
  summary!: {
    employeeRemoved: UserSummaryDto;
    newResponsible: UserSummaryDto;
    actionsTransferred: number;
    teamsRemovedFrom: number;
    actionDetails: ActionTransferredDto[];
  };
}
