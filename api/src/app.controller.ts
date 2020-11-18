import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import {
  CreatePasswordDTO,
  EditPasswordDTO,
  PaginationDTO,
  RegisterUserDTO,
} from './dto/User';
import { UsersService } from './user/users.service';

@Controller('')
export class AppController {
  constructor(
    private authService: AuthService,
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Post('auth/register')
  async registerUser(@Body() user: RegisterUserDTO) {
    return await this.appService.createUser(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/edit')
  async edit(
    @Req() req,
    @Body()
    body: {
      oldPassword: string;
      password: string;
      key: string;
      encryption: 'hmac' | 'sha512';
    },
  ) {
    return await this.appService.editUser(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/create')
  async createPassword(@Req() req, @Body() body: CreatePasswordDTO) {
    return await this.appService.createPassword(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/edit')
  async editPassword(@Req() req, @Body() body: Partial<EditPasswordDTO>) {
    return await this.appService.editPassword(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('password')
  async deletePassword(@Body() body: { id: number }) {
    await this.usersService.deletePassword(Number(body.id));
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Post('password')
  async getPasswords(@Req() req, @Body() body: PaginationDTO) {
    return this.usersService.getPasswords(req.user, body);
  }
}
