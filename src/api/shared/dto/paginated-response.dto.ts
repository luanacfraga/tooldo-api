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
