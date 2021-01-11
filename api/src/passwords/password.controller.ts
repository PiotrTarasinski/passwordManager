import { RestorePasswordDto } from './dto/restore-password-dto';
import { SharePasswordDto } from './dto/share-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ValidationPipe } from './../shared/pipes/validation.pipe';
import { Controller, Get, UsePipes, Post, Body, Param, Session, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordService } from './password.service';
import { CreatePasswordDto } from './dto';
import { User } from '../user/user.decorator';

@ApiBearerAuth()
@ApiTags('password')
@Controller('password')
export class PasswordController {
    constructor(private readonly passwordService: PasswordService) { }

    @ApiOperation({ summary: 'Get all passwords' })
    @ApiResponse({ status: 200, description: 'Return all passwords.' })
    @Get()
    async findAll(@User() user): Promise<any> {
        return await this.passwordService.findAll(user);
    }

    @ApiOperation({ summary: 'Get single password' })
    @ApiResponse({ status: 200, description: 'Returns decrypted password.' })
    @Get('get/:id')
    async find(@Param('id') id: string, @Session() session: { password: string }, @User() user): Promise<any> {
        return await this.passwordService.findOne(id, session, user);
    }

    @ApiOperation({ summary: 'Delete password' })
    @ApiResponse({ status: 200, description: 'Delete single password.' })
    @Delete('delete/:id')
    async delete(@Param('id') id: string, @User() user): Promise<any> {
        return await this.passwordService.delete(id, user);
    }

    @ApiOperation({ summary: 'Share password' })
    @ApiResponse({ status: 200, description: 'Share password with user of given id.' })
    @Post('share')
    async sharePassword(@Body() passData: SharePasswordDto): Promise<any> {
        return await this.passwordService.sharePassword(passData);
    }

    @ApiOperation({ summary: 'Restore previous state of saved password' })
    @Post('restore')
    async restorePassword(@Body() passData: RestorePasswordDto, @User() user): Promise<any> {
        return await this.passwordService.recoverLastState(passData.logId, user);
    }

    @ApiOperation({ summary: 'Get password log' })
    @ApiResponse({ status: 200, description: 'Return password log.' })
    @Get('passwordLog/:id')
    async getPasswordLog(@Param('id') id: string, @User() user): Promise<any> {
        return await this.passwordService.getPasswordLog(id);
    }

    @ApiOperation({ summary: 'Get password logs' })
    @ApiResponse({ status: 200, description: 'Return password logs.' })
    @Get('passwordLog')
    async getPasswordLogs(@User() user): Promise<any> {
        return await this.passwordService.getPasswordLogs(user.id);
    }

    @ApiOperation({ summary: 'Get password log' })
    @ApiResponse({ status: 200, description: 'Returns password log with decrypted values' })
    @ApiProperty({ description: "takes id of log record" })
    @Get('passwordLog/decrypt/:id')
    async findOneLog(@Param('id') id: string, @User() user): Promise<any> {
        return await this.passwordService.findOnePasswordLog(Number(id), user);
    }

    @ApiOperation({ summary: 'Create new password' })
    @UsePipes(new ValidationPipe())
    @Post('create')
    async create(@Body() passData: CreatePasswordDto, @Session() session: { password: string }, @User() user) {
        return await this.passwordService.create(passData, session, user);
    }


    @ApiOperation({ summary: 'Update existing password' })
    @UsePipes(new ValidationPipe())
    @Post('update')
    async update(@Body() passData: UpdatePasswordDto, @Session() session: { password: string }, @User() user) {
        return await this.passwordService.update(passData, session, user);
    }

}
