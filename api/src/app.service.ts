import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import db from './database/initializeDatabase';
import { Password } from './database/models/Password';
import {
  CreatePasswordDTO,
  EditPasswordDTO,
  RegisterUserDTO,
  UserCredentials,
} from './dto/User';

@Injectable()
export class AppService {
  constructor(private authService: AuthService) {}
  async createUser(user: RegisterUserDTO) {
    const salt = Math.random().toString(36).substr(2, 5);
    return await db.User.create({
      login: user.login,
      password: this.authService.hashPassword(
        user.encryption,
        user.password,
        salt,
      ),
      salt,
      isPasswordKeptAsHash: user.encryption === 'hmac' ? true : false,
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
  }

  async createPassword(user: UserCredentials, password: CreatePasswordDTO) {
    return await db.Password.create({
      userId: user.id,
      ...password,
      password: this.authService.encodePassword(
        password.password,
        password.key,
      ),
    }).catch((error) => {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    });
  }

  async editPassword(
    user: UserCredentials,
    newPassword: Partial<EditPasswordDTO>,
  ): Promise<[number, Array<Password>]> {
    const dbUser = await db.User.findByPk(user.id);
    if (await dbUser.hasPassword(newPassword.id)) {
      const { id, password, ...rest } = newPassword;
      return await db.Password.update(
        {
          ...rest,
          password: this.authService.encodePassword(password, newPassword.key),
        },
        {
          where: {
            id: newPassword.id,
          },
        },
      ).catch(() => {
        throw new InternalServerErrorException();
      });
    }
    throw new UnauthorizedException();
  }

  async decodePassword({
    password,
    key,
  }: {
    password: string;
    key: string;
  }): Promise<string> {
    return this.authService.decodePassword(password, key);
  }

  async editUser(
    user: UserCredentials,
    password: {
      oldPassword: string;
      password: string;
      key: string;
      encryption: 'hmac' | 'sha512';
    },
  ) {
    const salt = Math.random().toString(36).substr(2, 5);
    const dbUser = await db.User.findByPk(user.id);
    const oldPassword = dbUser.password;
    const encryption = dbUser.isPasswordKeptAsHash ? 'hmac' : 'sha512';
    if (
      oldPassword ===
      this.authService.hashPassword(
        encryption,
        password.oldPassword,
        dbUser.salt,
      )
    ) {
      await db.User.update(
        {
          password: this.authService.hashPassword(
            password.encryption,
            password.password,
            salt,
          ),
          salt,
          isPasswordKeptAsHash: password.encryption === 'hmac' ? true : false,
        },
        {
          where: {
            id: user.id,
          },
        },
      ).catch(() => {
        throw new InternalServerErrorException();
      });
      return await dbUser.getPasswords().then(async (passwords) => {
        return await Promise.all(
          passwords.map(async (pass) => {
            const decodedPassword = this.authService.decodePassword(
              pass.password,
              password.oldPassword,
            );
            return await db.Password.update(
              {
                password: this.authService.encodePassword(
                  decodedPassword,
                  password.password,
                ),
              },
              {
                where: {
                  id: pass.id,
                },
              },
            );
          }),
        );
      });
    } else {
      throw new UnauthorizedException();
    }
  }
}
