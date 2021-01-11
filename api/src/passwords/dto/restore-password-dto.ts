import { ApiProperty } from "@nestjs/swagger";

export class RestorePasswordDto {
    @ApiProperty()
    readonly logId: number;
}
