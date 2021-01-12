import { ApiProperty } from '@nestjs/swagger';
export class UpdatePasswordDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  readonly url: string;
  @ApiProperty()
  readonly description: string;
  @ApiProperty()
  readonly username: string;
  @ApiProperty()
  readonly password: string;
}
