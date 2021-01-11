import { ApiProperty } from '@nestjs/swagger';
export class CreatePasswordDto {
  @ApiProperty()
  readonly password: string;
  @ApiProperty()
  readonly description: string;
}
