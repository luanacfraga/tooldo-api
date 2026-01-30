import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetCompanyBlockedDto {
  @ApiProperty({
    description: 'Se a empresa deve ficar bloqueada (true) ou desbloqueada (false)',
    example: true,
  })
  @IsBoolean()
  blocked!: boolean;
}
