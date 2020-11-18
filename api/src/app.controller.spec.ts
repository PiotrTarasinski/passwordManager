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

  describe('getHello', () => {
    it('should create and delete new password', async () => {
      const appController = app.get<AppController>(AppController);
      const authService = app.get<AuthService>(AuthService);
      const user = await db.User.create({
        isPasswordKeptAsHash: true,
        login: 'test_test_user',
        password: authService.hashPassword('hmac', 'test', 'test'),
        salt: 'test',
      });
      const password = await appController.createPassword(
        { user: { id: user.id } },
        {
          description: 'test',
          key: 'test',
          login: 'test',
          password: 'test',
          webAddress: 'test',
        },
      );
      const { createdAt, updatedAt, id, ...result } = password.get();
      expect(result).toEqual({
        userId: user.id,
        description: 'test',
        login: 'test',
        password: authService.encodePassword('test', 'test'),
        webAddress: 'test',
      });
      await appController.deletePassword({ id: password.id });
      await user.destroy();
      expect(await db.Password.findByPk(password.id)).toBe(null);
    });

    it('should create and delete new user', async () => {
      const appController = app.get<AppController>(AppController);
      const appService = app.get<AuthService>(AuthService);
      const user = await appController.registerUser({
        login: 'test_test',
        encryption: 'sha512',
        password: 'test',
      });
      const { id, createdAt, updatedAt, salt, ...result } = user.get();
      expect(result).toEqual({
        login: 'test_test',
        password: appService.hashPassword('sha512', 'test', salt),
        isPasswordKeptAsHash: false,
      });
      await user.destroy();
      expect(await db.Password.findByPk(user.id)).toBe(null);
    });

    it('should edit a password', async () => {
      const appController = app.get<AppController>(AppController);
      const authService = app.get<AuthService>(AuthService);
      const user = await db.User.create({
        isPasswordKeptAsHash: true,
        login: 'test_test_user',
        password: authService.hashPassword('hmac', 'test', 'test'),
        salt: 'test',
      });
      const password = await appController.createPassword(
        { user: { id: user.id } },
        {
          description: 'test',
          key: 'test',
          login: 'test',
          password: 'test',
          webAddress: 'test',
        },
      );
      const { id } = password.get();
      await appController.editPassword(
        { user: { id: user.id } },
        { id, key: 'test', login: 'testorinho', password: 'testo' },
      );
      const { createdAt, updatedAt, id: id2, ...result } = (
        await db.Password.findByPk(id)
      ).get();
      expect(result).toEqual({
        userId: user.id,
        description: 'test',
        login: 'testorinho',
        password: authService.encodePassword('testo', 'test'),
        webAddress: 'test',
      });
      await appController.deletePassword({ id: password.id });
      await user.destroy();
      expect(await db.Password.findByPk(password.id)).toBe(null);
    });

    it('should edit a user and decode passwords', async () => {
      const appController = app.get<AppController>(AppController);
      const appService = app.get<AuthService>(AuthService);
      const authService = app.get<AuthService>(AuthService);
      const user = await db.User.create({
        isPasswordKeptAsHash: true,
        login: 'test_test_user',
        password: authService.hashPassword('hmac', 'test', 'test'),
        salt: 'test',
      });
      const { createdAt, updatedAt, id, ...result } = (
        await appController.createPassword(
          { user: { id: user.id } },
          {
            description: 'test',
            key: 'test',
            login: 'test',
            password: 'test',
            webAddress: 'test',
          },
        )
      ).get();
      expect(result).toEqual({
        userId: user.id,
        description: 'test',
        login: 'test',
        password: authService.encodePassword('test', 'test'),
        webAddress: 'test',
      });
      await appController.edit(
        { user: { id: user.id } },
        {
          key: 'test',
          encryption: 'hmac',
          oldPassword: 'test',
          password: 'testtest',
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
        login: 'test_test_user',
        password: appService.hashPassword('hmac', 'testtest', salt),
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
        description: 'test',
        login: 'test',
        password: authService.encodePassword('test', 'testtest'),
        webAddress: 'test',
      });
      await appController.deletePassword({ id });
      await user.destroy();
      expect(await db.Password.findByPk(id)).toBe(null);
    });
  });
});
