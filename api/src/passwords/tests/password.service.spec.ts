import { AddressEntity } from './../../user/address.entity';
import { SharedPasswordEntity } from './../password.entity';
import { usersRepositoryMockFactory } from './../../user/tests/user-repository-fake';
import { UserEntity } from './../../user/user.entity';
import { UserService } from './../../user/user.service';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordEntity } from '../password.entity';
import { PasswordService } from '../password.service';
import { passwordsRepositoryMockFactory, MockType } from './password-repository-fake';

describe('PasswordService', () => {
  let service: PasswordService;
  let repositoryMock: MockType<Repository<PasswordEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedPasswordEntity],
      providers: [PasswordService, {
        provide: getRepositoryToken(PasswordEntity),
        useFactory: passwordsRepositoryMockFactory
      }, UserService, {
        provide: getRepositoryToken(UserEntity),
        useFactory: usersRepositoryMockFactory
      },{
        provide: getRepositoryToken(SharedPasswordEntity),
        useFactory: passwordsRepositoryMockFactory
      }, {
        provide: getRepositoryToken(AddressEntity),
        useFactory: passwordsRepositoryMockFactory
      }],
    }).compile();
    service = module.get<PasswordService>(PasswordService);
    repositoryMock = module.get(getRepositoryToken(PasswordEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('creating new password', () => {

    it('throws an error when no password in session is provided', async () => {
      try {
        // @ts-ignore
        await service.create({ password: '', description: '' }, {});
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Validation failed. Please log out.');
      }
    })

    it('throws an error when no password in dto is provided', async () => {
      try {
        //@ts-ignore
        jest.spyOn(service, 'buildPasswordRO').mockResolvedValue({ passwordRO: {} });
        await service.create({ password: '', description: '' }, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Password was not provided');
      }
    })


    it('throws an error when user is not provided', async () => {

      try {
        //@ts-ignore
        jest.spyOn(service, 'buildPasswordRO').mockResolvedValue({ passwordRO: {} });
        await service.create({ password: 'test', description: '' }, { password: 'test' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not find password owner.');
      }

    })

    // it('should create response correctly when parameters are provided', async () => {

    //   //@ts-ignore
    //   const password = { password: 'testparameter', description: '' };

    //   //@ts-ignore
    //   const buildPasswordROSpy = jest.spyOn(service, 'buildPasswordRO').mockResolvedValue({ passwordRO: password });
    //   const session = { password: 'test' }


    //   const res = await service.create(password, session, {});
    //   expect(buildPasswordROSpy).toBeCalledTimes(1);
    //   expect(await service.create(password, session, {})).toEqual({ passwordRO: password })

    // })

  });

  describe('find one password', () => {

    it('throws an error when no user is provided', async () => {
      try {
        // @ts-ignore
        await service.findOne('5', {});
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not find password owner.');
      }
    })

    it('throws an error when no password in session is provided', async () => {
      try {
        // @ts-ignore
        await service.findOne('5', { password: '' }, {});
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Validation failed. Please log out.');
      }
    })

    it('finds password when parameters are correct', async () => {

      const session = { password: 'test' }
      const foundPassword = { author: {} as any, id: 5, updateTimestamp: () => { }, description: '', password: 'sadasd', created: new Date(), updated: new Date() };
      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(foundPassword);
      const res = await service.findOne('5', session, {});
      expect(findOneSpy).toBeCalledTimes(1);
      expect(await service.findOne('5', session, {})).toEqual(foundPassword);

    })
  });

  describe('find all passwords', () => {

    it('throws an error when no user is provided', async () => {
      try {
        // @ts-ignore
        await service.findAll();
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not find password owner.');
      }
    })

    // it('finds passwords when parameters are correct', async () => {
    //   const returnArr = [{ author: {} as any, id: 5, updateTimestamp: () => { }, description: '', password: 'sadasd', created: new Date(), updated: new Date() }];
    //   const findAllSpy = jest.spyOn(service, 'findAll');
    //   repositoryMock.find.mockReturnValue(returnArr);
    //   expect(await service.findAll({})).toEqual(returnArr)
    //   expect(findAllSpy).toHaveBeenCalledTimes(1);
    // })
  });

  describe('delete password', () => {

    it('throws an error when no user is provided', async () => {
      try {
        // @ts-ignore
        await service.delete('5');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Could not find password owner.');
      }
    })

    it('throws an error when no id is provided', async () => {
      try {
        // @ts-ignore
        await service.delete(null, {});
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('No id was provided');
      }
    })

    // it('deletes password when parameters are correct', async () => {
    //   const returnArr = [{ author: {} as any, id: 5, updateTimestamp: () => { }, description: '', password: 'sadasd', created: new Date(), updated: new Date() }];
    //   const findAllSpy = jest.spyOn(service, 'delete');
    //   repositoryMock.find.mockReturnValue(returnArr);
    //   expect(await service.delete('5', {})).toEqual({ message: "Deletion OK" })
    //   expect(findAllSpy).toHaveBeenCalledTimes(1);
    // })
  });

});