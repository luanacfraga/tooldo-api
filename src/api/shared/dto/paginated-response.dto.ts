import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Número da página atual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total de itens',
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Se existe próxima página',
    example: true,
    required: false,
  })
  hasNextPage?: boolean;

  @ApiProperty({
    description: 'Se existe página anterior',
    example: false,
    required: false,
  })
  hasPreviousPage?: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Lista de itens',
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: 'Metadados de paginação',
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
