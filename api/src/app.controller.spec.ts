import { Test, TestingModule } from '@nestjs/testing';
import db from '../src/database/initializeDatabase';
import { UsersService } from '../src/user/users.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';

describe('AppController', () => {
  let app: TestingModule;
  let users: TestingModule;
  let auth: TestingModule;

  beforeAll(async () => {
    users = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    app = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: UsersService,
          useClass: UsersService,
        },
      ],
    }).compile();
    db;
  });

  describe('api tests', () => {
    it('should encode and decode password', async () => {
      const authService = app.get<AuthService>(AuthService);

      const password = 'zx1Q10.C';
      const key = 'key';
      const encodedPassword = authService.encodePassword(password, key);
      const decodedPassword = authService.decodePassword(encodedPassword, key);

      expect(decodedPassword).toBe(password);
    });

    it('should create a new user', async () => {
      const appController = app.get<AppController>(AppController);
      const appService = app.get<AuthService>(AuthService);
      const user = await appController.registerUser({
        login: 'username',
        encryption: 'hmac',
        password: 'password',
      });
      const { id, createdAt, updatedAt, salt, ...result } = user.get();
      expect(result).toEqual({
        login: 'username',
        password: appService.hashPassword('hmac', 'password', salt),
        isPasswordKeptAsHash: true,
      });

      await user.destroy();
      expect(await db.Password.findByPk(user.id)).toBe(null);
    });

    it('should add a new password to wallet', async () => {
      const appController = app.get<AppController>(AppController);
      const authService = app.get<AuthService>(AuthService);
      const user = await db.User.create({
        isPasswordKeptAsHash: false,
        login: 'username',
        password: authService.hashPassword('sha512', 'password', 'salt'),
        salt: 'test',
      });
      const password = await appController.createPassword(
        { user: { id: user.id } },
        {
          description: 'test password',
          key: 'password',
          login: 'username',
          password: 'password',
          webAddress: 'www.test-site.com',
        },
      );
      const { createdAt, updatedAt, id, ...result } = password.get();
      expect(result).toEqual({
        userId: user.id,
        description: 'test password',
        login: 'username',
        password: authService.encodePassword('password', 'password'),
        webAddress: 'www.test-site.com',
      });

      await appController.deletePassword({ id: password.id });
      await user.destroy();
      expect(await db.Password.findByPk(password.id)).toBe(null);
    });

    it('should edit a password', async () => {
      const appController = app.get<AppController>(AppController);
      const authService = app.get<AuthService>(AuthService);
      const user = await db.User.create({
        isPasswordKeptAsHash: true,
        login: 'username',
        password: authService.hashPassword('hmac', 'password', 'salt'),
        salt: 'salt',
      });
      const password = await appController.createPassword(
        { user: { id: user.id } },
        {
          description: 'test password',
          key: 'password',
          login: 'username',
          password: 'password',
          webAddress: 'www.test-site.com',
        },
      );
      const { id } = password.get();
      await appController.editPassword(
        { user: { id: user.id } },
        { id, key: 'password', login: 'username2', password: 'password2' },
      );
      const { createdAt, updatedAt, id: id2, ...result } = (
        await db.Password.findByPk(id)
      ).get();
      expect(result).toEqual({
        userId: user.id,
        description: 'test password',
        login: 'username2',
        password: authService.encodePassword('password2', 'password'),
        webAddress: 'www.test-site.com',
      });

      await appController.deletePassword({ id: password.id });
      await user.destroy();
      expect(await db.Password.findByPk(password.id)).toBe(null);
    });

    it('should change user main password and decode passwords in wallet', async () => {
      const appController = app.get<AppController>(AppController);
      const appService = app.get<AuthService>(AuthService);
      const authService = app.get<AuthService>(AuthService);
      const user = await db.User.create({
        isPasswordKeptAsHash: true,
        login: 'username',
        password: authService.hashPassword('hmac', 'password', 'salt'),
        salt: 'salt',
      });
      const { createdAt, updatedAt, id, ...result } = (
        await appController.createPassword(
          { user: { id: user.id } },
          {
            description: 'test password',
            key: 'password',
            login: 'username',
            password: 'password',
            webAddress: 'www.test-site.com',
          },
        )
      ).get();
      expect(result).toEqual({
        userId: user.id,
        description: 'test password',
        login: 'username',
        password: authService.encodePassword('password', 'password'),
        webAddress: 'www.test-site.com',
      });
      await appController.edit(
        { user: { id: user.id } },
        {
          key: 'password',
          encryption: 'hmac',
          oldPassword: 'password',
          password: 'password2',
        },
      );
      const {
        id: userId,
        createdAt: userCreatedAt,
        updatedAt: userUpdatedAt,
        salt,
        ...rest
      } = (await db.User.findByPk(user.id)).get();
      expect(rest).toEqual({
        login: 'username',
        password: appService.hashPassword('hmac', 'password2', salt),
        isPasswordKeptAsHash: true,
      });
      const {
        createdAt: newPassCA,
        updatedAt: newPassUA,
        id: newPassId,
        ...newPassRest
      } = (await db.Password.findByPk(id)).get();
      expect(newPassRest).toEqual({
        userId: user.id,
        description: 'test password',
        login: 'username',
        password: authService.encodePassword('password', 'password2'),
        webAddress: 'www.test-site.com',
      });

      await appController.deletePassword({ id });
      await user.destroy();
      expect(await db.Password.findByPk(id)).toBe(null);
    });
  });
});
