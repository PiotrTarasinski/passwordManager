import { AddressEntity } from './../../user/address.entity';
import { UserService } from './../../user/user.service';
import { usersRepositoryMockFactory } from './../../user/tests/user-repository-fake';
import { UserEntity } from './../../user/user.entity';
import { passwordsRepositoryMockFactory } from './password-repository-fake';
import { SharedPasswordEntity } from './../password.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordController } from '../password.controller';
import { PasswordEntity } from '../password.entity';
import { PasswordService } from '../password.service';


class PasswordServiceMock extends PasswordService {
  async findAll(user): Promise<any> {
    return [];
  }
  async find(id, session, user): Promise<any> {
    return {};
  }
  async create(passData, session, user): Promise<any> {
    return {};
  }
}

describe('PasswordController', () => {
  let controller: PasswordController;
  let service: PasswordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordController],
      providers: [PasswordService, {
        provide: getRepositoryToken(PasswordEntity),
        useValue: PasswordServiceMock
      }, {
        provide: getRepositoryToken(SharedPasswordEntity),
        useFactory: passwordsRepositoryMockFactory
      }, UserService, {
        provide: getRepositoryToken(UserEntity),
        useFactory: usersRepositoryMockFactory
      }, {
        provide: getRepositoryToken(AddressEntity),
        useFactory: passwordsRepositoryMockFactory
      }],
    }).compile();

    service = module.get<PasswordService>(PasswordService)
    controller = module.get<PasswordController>(PasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {

    it('should return an array of passwords', async () => {
      const result = [{ author: {} as any, id: 5, updateTimestamp: () => { }, description: '', password: 'sadasd', created: new Date(), updated: new Date() }];
      //@ts-ignore
      jest.spyOn(service, 'findAll').mockImplementation(() => result);
      expect(await controller.findAll({})).toBe(result);
    })
  })

  describe('find()', () => {

    it('should return password', async () => {
      const result = { author: {} as any, id: 5, updateTimestamp: () => { }, description: '', password: 'sadasd', created: new Date(), updated: new Date() };
      //@ts-ignore
      jest.spyOn(service, 'findOne').mockImplementation(() => result);
      expect(await controller.find('5', { password: 'test' }, {})).toBe(result);
    })
  })

  describe('delete()', () => {

    it('should delete password', async () => {
      const result = { message: 'Deletion OK' };
      //@ts-ignore
      jest.spyOn(service, 'delete').mockImplementation(() => result);
      expect(await controller.delete('5', {})).toEqual({ message: 'Deletion OK' });
    })
  })

  describe('create()', () => {

    it('should return created password', async () => {
      const result = { author: {} as any, id: 5, updateTimestamp: () => { }, description: '', password: 'sadasd', created: new Date(), updated: new Date() };
      //@ts-ignore
      jest.spyOn(service, 'create').mockImplementation(() => result);
      expect(await controller.create({ password: 'test', description: 'test' }, { password: 'test' }, {})).toBe(result);
    })
  })
});
