import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly password: string;
  @ApiProperty()
  readonly type: string;
}