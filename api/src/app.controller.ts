import { Body, Controller, Delete, Post, Req, UseGuards, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import {
  CreatePasswordDTO,
  EditPasswordDTO,
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
    await this.appService.createUser(user);
    return {};
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
      encryption: 'hmac' | 'sha512';
    },
  ) {
    return this.appService.editUser(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/create')
  async createPassword(@Req() req, @Body() body: CreatePasswordDTO) {
    this.appService.createPassword(req.user, body);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/edit')
  async editPassword(@Req() req, @Body() body: EditPasswordDTO) {
    this.appService.editPassword(req.user, body);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Delete('password')
  async decodePassword(@Req() req, @Query() query: { id: string }) {
    this.usersService.deletePassword(query.id);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @Get('password')
  async getPasswords(@Req() req) {
    return this.usersService.getPasswords(req.user);
  }
}
