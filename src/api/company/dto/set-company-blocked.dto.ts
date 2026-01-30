import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class SetCompanyBlockedDto {
  @ApiProperty({
    description:
      'Se a empresa deve ficar bloqueada (true) ou desbloqueada (false)',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === true || value === 'true') {
      return true;
    }
    if (value === false || value === 'false') {
      return false;
    }
    return value;
  })
  @IsBoolean({ message: 'blocked deve ser true ou false' })
  blocked!: boolean;
}
