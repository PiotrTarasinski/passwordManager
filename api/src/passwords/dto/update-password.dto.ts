import { ApiProperty } from '@nestjs/swagger';
export class UpdatePasswordDto {
  @ApiProperty()
  password: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  id: number;
}
