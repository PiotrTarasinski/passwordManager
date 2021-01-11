import { ApiProperty } from '@nestjs/swagger';
export class SharePasswordDto {
    @ApiProperty()
    readonly email: string;
    @ApiProperty()
    readonly passwordId: string;
}
