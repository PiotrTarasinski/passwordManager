import { PasswordEntity } from './../../passwords/password.entity';
import { PasswordService } from './../../passwords/password.service';
import { HttpException, forwardRef } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { UserService } from '../user.service';
import { usersRepositoryMockFactory, MockType, passwordServiceMockFactory } from './user-repository-fake';
import { passwordsRepositoryMockFactory } from '../../passwords/tests/password-repository-fake';
import { AddressEntity } from '../address.entity';
import { addressRepositoryMockFactory } from './address-repository-fake';

describe('UserService', () => {
  let service: UserService;
  let passwordService: PasswordService;
  let repositoryMock: MockType<Repository<UserEntity>>;
  let addressRepositoryMock: MockType<Repository<AddressEntity>>;
  const oldEnv = process.env;
  const mockedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiZXhwIjoxNjA5NTcyNzM0Ljc5MiwiaWF0IjoxNjA0Mzg4NzM0fQ.eZKUPN62uxn0qHkoTO7zXXdnalRgUDSHoij8dqrIuGU';
  const mockedPassword = 'R5cCI6IkpXVCJ9.e';

  beforeEach(async () => {
    process.env = { ...oldEnv };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {
        provide: getRepositoryToken(UserEntity),
        useFactory: usersRepositoryMockFactory
      }, {
          provide: getRepositoryToken(AddressEntity),
          useFactory: addressRepositoryMockFactory
        }, PasswordService, {
          provide: getRepositoryToken(PasswordEntity),
          useFactory: passwordsRepositoryMockFactory
        }, {
          provide: PasswordService, useFactory: passwordServiceMockFactory
        }],
    }).compile();

    service = module.get<UserService>(UserService);
    passwordService = module.get<PasswordService>(PasswordService);

    addressRepositoryMock = module.get(getRepositoryToken(AddressEntity));
    repositoryMock = module.get(getRepositoryToken(UserEntity));
    jest.spyOn(service, 'generateJWT').mockImplementation(() => mockedToken);
    jest.spyOn(service, 'buildPassword').mockImplementation(() => mockedPassword);
  });

  afterAll(() => {
    process.env = oldEnv;
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('creating new user', () => {

    it('throws an error when user already exists', async () => {
      try {
        repositoryMock.findOne.mockReturnValue({ username: 'test', email: 'test@gmail.com', type: 'HMAC' });
        await service.create({ username: 'test', email: 'test@gmail.com', type: 'HMAC', password: 'teststring' }, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Input data validation failed');
      }
    })

    it('throws an error when password is empty', async () => {
      try {
        repositoryMock.findOne.mockReturnValue({ username: 'test', email: 'test@gmail.com', type: 'HMAC' });
        await service.create({ username: 'test', email: 'test@gmail.com', type: 'HMAC', password: '' }, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response.errors.password).toBe('Invalid password.');
        expect(e.message).toBe('Input data validation failed. Please provide valid password.');
      }
    })

    it('throws an error when user already exists', async () => {
      try {
        repositoryMock.findOne.mockReturnValue({ username: 'test', email: 'test@gmail.com', type: 'HMAC' });
        await service.create({ username: 'test', email: 'test@gmail.com', type: 'HMAC', password: 'test' }, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response.errors.username).toBe('Username and email must be unique.');
        expect(e.message).toBe('Input data validation failed');
      }
    })

    it('creates user when parameters are ok', async () => {
      const mockResponse = {
        user: {
          id: undefined,
          username: 'test',
          password: 'R5cCI6IkpXVCJ9.e',
          email: 'test@gmail.com',
          bio: undefined,
          token: mockedToken,
          image: undefined
        }
      };

      repositoryMock.findOne.mockReturnValue(null);
      const res = await service.create({ username: 'test', email: 'test@gmail.com', password: 'test', type: 'HMAC' }, { password: 'test' });
      expect(res).toEqual(mockResponse);
    })
  });

  describe('updating existing user', () => {

    it('throws an error when user password is empty', async () => {
      try {
        passwordService.findOne = jest.fn().mockReturnValue(null);
        passwordService.findAll = jest.fn().mockReturnValue([{ username: 'test', email: 'test@gmail.com', type: 'HMAC', id: 5 }]);
        jest.spyOn(service, 'generateHash').mockImplementation(() => 'somesalt');
        jest.spyOn(service, 'buildPassword').mockImplementation(() => mockedPassword);
        await service.update(5, { username: 'test', email: 'test@gmail.com', type: 'HMAC', password: '' }, {}, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Input data validation failed');
        expect(e.response.errors.password).toBe('Password must not be empty.');
      }
    })

    it('throws an error when id is not numeric ', async () => {
      try {
        passwordService.findOne = jest.fn().mockReturnValue(null);
        passwordService.findAll = jest.fn().mockReturnValue([{ username: 'test', email: 'test@gmail.com', type: 'HMAC', id: 5 }]);
        jest.spyOn(service, 'generateHash').mockImplementation(() => 'somesalt');
        jest.spyOn(service, 'buildPassword').mockImplementation(() => mockedPassword);

        await service.update('xd' as unknown as number, { username: 'test', email: 'test@gmail.com', type: 'HMAC', password: 'test' }, {}, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Input data validation failed');
        expect(e.response.errors.password).toBe('Id must be valid number.');
      }
    })


    it('should update user when parameters are correct', async () => {
      const mockedUser = {
        id: 5,
        username: 'test',
        password: 'R5cCI6IkpXVCJ9.e',
        type: 'HMAC',
        email: 'test@gmail.com',
        salt: 'somesalt'
      };

      passwordService.findOne = jest.fn().mockReturnValue(null);
      passwordService.findAll = jest.fn().mockReturnValue([{ username: 'test', email: 'test@gmail.com', type: 'HMAC', id: 5 }]);
      jest.spyOn(service, 'generateHash').mockImplementation(() => 'somesalt');
      jest.spyOn(service, 'decodePassword').mockImplementation(() => 'test');
      jest.spyOn(service, 'buildPassword').mockImplementation(() => mockedPassword);
      const res = await service.update(5, { username: 'test', email: 'test@gmail.com', type: 'HMAC', password: 'test' }, {}, { password: 'test' });
      expect(res).toEqual(mockedUser);
    })

  });


  describe('find one user', () => {

    it('throws an error when no password is provided', async () => {
      try {
        await service.findOne({ email: 'test@test.com', password: '' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response.errors.password).toBe('Password must not be empty.');
        expect(e.message).toBe('Input data validation failed');
      }
    })

    it('throws an error when no email is provided', async () => {
      try {
        await service.findOne({ email: '', password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response.errors.email).toBe('Email must not be empty.');
        expect(e.message).toBe('Input data validation failed');
      }
    })

    it('throws an error when both username and password are not provided ', async () => {
      try {
        await service.findOne({ email: '', password: '' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Input data validation failed');
      }
    })

    it('returns null when it doesnt find an user ', async () => {
      try {
        repositoryMock.findOne.mockReturnValue(null);
        const res = await service.findOne({ email: 'test@gmail.com', password: 'test@gmail.com' });
        expect(res).toEqual(null);
      } catch (e) {
      }
    })

    it('finds user when parameters are correct for type hmac', async () => {

      process.env.SECRET_KEY = 'test';
      const foundUser = { username: 'test', token: 'test', email: 'test', password: 'R5cCI6IkpXVCJ9.e' };
      repositoryMock.findOne.mockReturnValue(foundUser as any);
      const res = await service.findOne({ email: 'test@test.com', password: 'test' });
      expect(await service.findOne({ email: 'test@test.com', password: 'test' })).toEqual(foundUser);

    })

    it('finds user when parameters are correct for type SHA512', async () => {

      process.env.SECRET_KEY = 'test';
      const foundUser = { username: 'test', token: 'test', email: 'test', type: 'SHA512', password: 'R5cCI6IkpXVCJ9.e' };
      repositoryMock.findOne.mockReturnValue(foundUser as any);
      const res = await service.findOne({ email: 'test@test.com', password: 'test' });
      expect(await service.findOne({ email: 'test@test.com', password: 'test' })).toEqual(foundUser);

    })

  });

  describe('find all users', () => {

    it('finds users when parameters are correct', async () => {
      const returnArr = [{ username: 'test', token: 'test', email: 'test', type: 'SHA512', password: 'R5cCI6IkpXVCJ9.e' }];
      repositoryMock.find.mockReturnValue(returnArr as any);
      expect(await service.findAll()).toEqual(returnArr);
    })
  });


  describe('delete user', () => {

    it('throws an error when email is empty', async () => {
      const returnUser = { username: 'test', token: 'test', email: 'test', type: 'SHA512', password: 'R5cCI6IkpXVCJ9.e' };
      repositoryMock.delete.mockReturnValue(returnUser as any);
      try {
        await service.delete('');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Input data validation failed');
      }
    })


    it('deletes user', async () => {
      const returnUser = { username: 'test', token: 'test', email: 'test', type: 'SHA512', password: 'R5cCI6IkpXVCJ9.e' };
      repositoryMock.delete.mockReturnValue(returnUser as any);
      expect(await service.delete('test@test.com')).toEqual(returnUser);
    })
  });

  describe('find user by id', () => {

    it('throws an error when user is not found', async () => {
      try {
        repositoryMock.findOne.mockReturnValue(null);
        await service.findById(5);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
      }
    })

    it('passes when it finds user', async () => {
      const returnUser = { username: 'test', token: 'test', email: 'test', password: '3092f9a3' };
      repositoryMock.findOne.mockReturnValue(returnUser);
      expect(await service.findById(5)).toEqual({ user: { ...returnUser, bio: undefined, id: undefined, image: undefined, token: mockedToken } });
    })
  });

  describe('find user by email', () => {

    it('throws an error when user is not found', async () => {
      try {
        repositoryMock.findOne.mockReturnValue(null);
        await service.findByEmail('test@test.com');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
      }
    })

    it('passes when it finds user', async () => {
      const returnUser = { username: 'test', token: mockedToken, email: 'test', password: '3092f9a3' };
      repositoryMock.findOne.mockReturnValue(returnUser);

      jest.spyOn(service, 'buildUserRO').mockImplementation((): any => returnUser);
      expect(await service.findByEmail('test@test.com')).toEqual(returnUser);
    })
  });

  describe('delete blockade', () => {

    it('returns "ok" when deletion is successful', async () => {

      addressRepositoryMock.delete.mockReturnValue('ok');
      expect(await service.deleteBlockade('127.0.0.1')).toEqual('ok');
    })

    it('throws an error when ip address is empty', async () => {
      try {
        await service.deleteBlockade('');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Http Exception');
      }
    })

  });

  describe('find by address Ip', () => {

    it('returns address when ip is correct', async () => {
      const foundAddress = { id: 5, ipAddress: '127.0.0.1', isBlocked: false };
      addressRepositoryMock.findOne.mockReturnValue(foundAddress);
      expect(await service.findAddressDataByAddress('127.0.0.1')).toEqual(foundAddress);
    })
  });

  describe('Blockade functionality methods', () => {
    it('should return null if there is not user/account', async () => {
      const email = '';
      const account: AddressEntity = null;

      expect(await service.checkIfBlocked(email, account)).toBeFalsy()
    });
  })


  it('should return nothing if user/account is not blocked', async () => {
    const user: UserEntity = {
      id: 1,
      password:
        '9ba1f63365a6caf66e46348f43cdef956015bea997adeb06e69007ee3ff517df10fc5eb860da3d43b82c2a040c931119d2dfc6d08e253742293a868cc2d82015',
      username: 'test',
      type: 'hmac',
      salt: 'test',
      blockDate: null,
      isBlocked: false,
      numberOfWrongLogins: null,
      lastSuccessLogin: null,
      lastFailureLogin: null,
      bio: '',
      image: '',
      email: "vaachi1@gmail.com",
      passwords: []
    };
    const account: AddressEntity = {
      id: 1,
      ipAddress: '::1',
      blockDate: null,
      isBlocked: false,
      numberOfWrongLogins: null,
      lastSuccessLogin: null,
      lastFailureLogin: null,
    };
    jest.spyOn(service, 'findByEmail').mockImplementation(() => user as any);
    expect(await service.checkIfBlocked('vaachi1@gmail.com', account)).toBeUndefined();
  });

  it('should update user data when login is successful', async () => {
    const user: UserEntity = {
      id: 1,
      password:
        '9ba1f63365a6caf66e46348f43cdef956015bea997adeb06e69007ee3ff517df10fc5eb860da3d43b82c2a040c931119d2dfc6d08e253742293a868cc2d82015',
      username: 'test',
      type: 'hmac',
      salt: 'test',
      blockDate: null,
      isBlocked: false,
      numberOfWrongLogins: null,
      lastSuccessLogin: null,
      lastFailureLogin: null,
      bio: '',
      image: '',
      email: "vaachi1@gmail.com",
      passwords: []
    };

    repositoryMock.save.mockReturnValue(user as any);

    expect(
      await service.setUserSuccessLoginData(user),
    ).toEqual(user);
  });



  it('should update user table when user fails login', async () => {
    const user: UserEntity = {
      id: 1,
      password:
        '9ba1f63365a6caf66e46348f43cdef956015bea997adeb06e69007ee3ff517df10fc5eb860da3d43b82c2a040c931119d2dfc6d08e253742293a868cc2d82015',
      username: 'test',
      type: 'hmac',
      salt: 'test',
      blockDate: null,
      isBlocked: false,
      numberOfWrongLogins: null,
      lastSuccessLogin: null,
      lastFailureLogin: null,
      bio: '',
      image: '',
      email: "vaachi1@gmail.com",
      passwords: []
    };


    repositoryMock.save.mockReturnValue(user as any);

    expect(
      await service.handleUserLoginFail(user),
    ).toEqual(user);
  });

  it('should insert to address table when address is empty and user fails', async () => {
    const address: AddressEntity = {
      id: 1,
      ipAddress: "127.0.0.1",
      lastFailureLogin: new Date(),
      lastSuccessLogin: null,
      isBlocked: false,
      blockDate: null,
      numberOfWrongLogins: 1,
    };

    addressRepositoryMock.save.mockReturnValue(address as any);

    expect(
      await service.handleIpLoginFail(null, "127.0.0.1"),
    ).toEqual(address);
  });

  it('should update address table when address is present and user fails', async () => {
    const address: AddressEntity = {
      id: 1,
      ipAddress: "127.0.0.1",
      lastFailureLogin: new Date(),
      lastSuccessLogin: null,
      isBlocked: false,
      blockDate: null,
      numberOfWrongLogins: 1,
    };

    addressRepositoryMock.save.mockReturnValue(address as any);

    expect(
      await service.handleIpLoginFail(address, "127.0.0.1"),
    ).toEqual(address);
  });

  it('should insert to address table when address is empty and user succeeds', async () => {
    const address: AddressEntity = {
      id: 1,
      ipAddress: "127.0.0.1",
      lastFailureLogin: new Date(),
      lastSuccessLogin: null,
      isBlocked: false,
      blockDate: null,
      numberOfWrongLogins: 1,
    };

    addressRepositoryMock.save.mockReturnValue(address as any);

    expect(
      await service.setIpSuccessLoginData(null, "127.0.0.1"),
    ).toEqual(address);
  });

  it('should update address table when address is present and user succeeds', async () => {
    const address: AddressEntity = {
      id: 1,
      ipAddress: "127.0.0.1",
      lastFailureLogin: new Date(),
      lastSuccessLogin: null,
      isBlocked: false,
      blockDate: null,
      numberOfWrongLogins: 1,
    };

    addressRepositoryMock.save.mockReturnValue(address as any);

    expect(
      await service.setIpSuccessLoginData(address, "127.0.0.1"),
    ).toEqual(address);
  });

});