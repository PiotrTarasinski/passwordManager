import { ApiProperty } from '@nestjs/swagger';
export class GetPasswordDto {
    @ApiProperty()
    readonly id: string;
}
