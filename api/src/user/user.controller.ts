import { Get, Post, Body, Put, Delete, Controller, UsePipes, Session, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRO } from './interfaces/user.interface';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { User } from './user.decorator';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

import {
  ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller()
export class UserController {

  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Get details of existing user based on jwt token' })
  @ApiResponse({ status: 200, description: 'User details' })
  @Get('user')
  async findMe(@User('email') email: string): Promise<UserRO> {
    return await this.userService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Update existing user' })
  @ApiBody({ type: [UpdateUserDto] })
  @Put('user')
  async update(@User('id') userId: number, @Body('user') userData: UpdateUserDto, @User() user, @Session() session: { password: string }) {
    return await this.userService.update(userId, userData, user, session);
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: [CreateUserDto] })
  @UsePipes(new ValidationPipe())
  @Post('users')
  async create(@Body('user') userData: CreateUserDto, @Session() session: { password: string }) {
    return this.userService.create(userData, session);
  }

  @ApiOperation({ summary: 'Delete login blockades for provided user' })
  @Delete('user/blockade')
  async deleteBlockade(@Body() email: String, @Request() req) {
    return await this.userService.deleteBlockade(req.ip);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: [LoginUserDto] })
  @UsePipes(new ValidationPipe())
  @Post('users/login')
  async login(@Body('user') loginUserDto: LoginUserDto, @Session() session: { password: string }, @Request() req): Promise<UserRO> {

    try {

      const _user = await this.userService.findOne(loginUserDto);
      const addressResult = await this.userService.findAddressDataByAddress(req.ip);
      try {
        await this.userService.checkIfBlocked(loginUserDto.email, addressResult);
      } catch (err) {
        throw err;
      }


      if (!_user) {
        const returnedAddress = await this.userService.handleIpLoginFail(addressResult, req.ip);

        if (returnedAddress.isBlocked) {
          throw new HttpException("Your ip address is blocked. Please contact administrator", 401)
        }
        else {
          throw new HttpException("Something went wrong", 401);
        }
      };


      await this.userService.setIpSuccessLoginData(addressResult, req.ip);
      await this.userService.setUserSuccessLoginData(_user);
      session.password = loginUserDto.password;
      const token = await this.userService.generateJWT(_user);
      const { email, bio, image, lastFailureLogin, lastSuccessLogin } = _user;
      const user = { email, token, bio, image, lastFailureLogin, lastSuccessLogin };
      return { user }
    } catch (err) {
      console.log(err);
      if (err.response) {
        throw err;
      } else {
        throw new HttpException("Something went wrong", 401);
      }
    }
  }
}
