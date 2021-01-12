import { ApiProperty } from '@nestjs/swagger';

export class CreatePasswordDto {
  @ApiProperty()
  readonly url: string;
  @ApiProperty()
  readonly description: string;
  @ApiProperty()
  readonly username: string;
  @ApiProperty()
  readonly password: string;
}
