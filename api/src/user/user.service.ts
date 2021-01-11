import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
const jwt = require('jsonwebtoken');
import { SECRET } from '../config';
import { UserRO } from './interfaces/user.interface';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import * as hasha from 'hasha';
import { pick, identity } from 'underscore'
import { PasswordService } from '../passwords/password.service';
import * as CryptoAES from 'crypto-js/aes';
import * as CryptoENC from 'crypto-js/enc-utf8';
import { PasswordEntity } from '../passwords/password.entity';
import { AddressEntity } from './address.entity';

@Injectable()
export class UserService {


  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PasswordEntity)
    private readonly passwordRepository: Repository<PasswordEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @Inject(forwardRef(() => PasswordService))
    private passwordService: PasswordService
  ) { }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne({ email, password }: LoginUserDto): Promise<UserEntity> {

    if (!email || email === '') {
      const errors = { email: 'Email must not be empty.' };
      throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);

    }

    if (!password || password === '') {
      const errors = { password: 'Password must not be empty.' };
      throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);

    }

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      return null;
    }

    if (user.type === 'SHA512') {
      if (this.buildPassword(user.salt, password, 'SHA512') === user.password) {
        return user;
      }
      else {
        this.handleUserLoginFail(user);
      }
    }

    else {
      if (this.buildPassword(user.salt, password, 'HMAC') === user.password) {
        return user;
      }
      else {
        this.handleUserLoginFail(user);
      }
    }

    return null;
  }

  async create(dto: CreateUserDto, session: { password: string }): Promise<UserRO> {

    const { email, password, type } = dto;

    const user = await this.userRepository.findOne({ where: [{ email }] });


    if (!dto?.password || dto?.password === '') {
      const errors = { password: 'Invalid password.' };
      throw new HttpException({ message: 'Input data validation failed. Please provide valid password.', errors }, HttpStatus.BAD_REQUEST);
    }

    if (user) {
      const errors = { username: 'Username and email must be unique.' };
      throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);

    }

    let newUser = new UserEntity();
    newUser.email = email;
    newUser.salt = this.generateHash();
    newUser.type = type;
    newUser.password = this.buildPassword(newUser.salt, password, type);

    const errors = await validate(newUser);
    if (errors.length > 0) {
      const _errors = { username: 'Userinput is not valid.' };
      throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);

    } else {
      const savedUser = await this.userRepository.save(newUser);
      session.password = password;
      return this.buildUserRO(savedUser);
    }

  }

  async update(id: number, dto: UpdateUserDto, user: any, session: { password: string }): Promise<UserEntity> {
    let toUpdate = await this.userRepository.findOne(id);
    const { type, password, email } = dto;
    const oldPass = toUpdate.password;
    if (!/^-?\d+$/.test(`${id}`)) {
      const errors = { password: 'Id must be valid number.' };
      throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);
    }

    if (!password || password === '') {
      const errors = { password: 'Password must not be empty.' };
      throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);
    }
    const createdSalt = this.generateHash();
    const passwordToUpdate = type === 'SHA512'
      ? this.buildPassword(createdSalt, password, 'SHA512')
      : this.buildPassword(createdSalt, password, 'HMAC');

    const passwords = this.passwordService.findAll(user);
    const decodedPasswords = (await passwords).map((i) => {

      i.password = this.decodePassword(i, oldPass, passwordToUpdate)
      return i;
    });
    this.passwordRepository.save(decodedPasswords);
    session.password = password;


    delete toUpdate.password;
    const updated = {
      id,
      password: password ? passwordToUpdate : null,
      type: type ? type : null,
      email: email ? email : null,
      salt: createdSalt,
    };


    return await this.userRepository.save(pick(updated, identity));
  }


  async delete(email: string): Promise<DeleteResult> {

    if (!email || email === '') {
      const errors = { username: 'Email must not be empty.' };
      throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);
    }

    return await this.userRepository.delete({ email: email });
  }

  async findById(id: number): Promise<UserRO> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      return null;
    }

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<UserRO> {
    const user = await this.userRepository.findOne({ email: email });

    if (!user) {
      return null;
    }

    return this.buildUserRO(user);
  }

  async findRawByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ email: email });

    if (!user) {
      return null;
    }

    return user;
  }

  async findAddressDataByAddress(address: string): Promise<AddressEntity> {
    const searchResult = await this.addressRepository.findOne({ ipAddress: address })
    return searchResult;
  }

  async deleteBlockade(ipAddress: string) {
    try {
      const res = this.addressRepository.delete({ ipAddress })

      if (!ipAddress || ipAddress === '') {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Something went wrong, try again later.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return res;
    }
    catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Something went wrong, try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkIfBlocked(email: string, address: AddressEntity) {
    if (!email || email === '') {
      return;
    }

    const res = await this.findByEmail(email);
    if (!res?.user || !address) {
      return;
    }
    const { user } = res;

    if (user.isBlocked || address.isBlocked) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'Your account is blocked, unblock it by clicking on the unblock button.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const blockedDate = user.blockDate || address.blockDate;


    if (blockedDate?.getTime() >= new Date().getTime()) {
      this.handleIpLoginFail(address, address.ipAddress);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Your account is blocked until ${blockedDate}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleUserLoginFail({ numberOfWrongLogins, id }: UserEntity) {
    try {
      const wrongLogins = numberOfWrongLogins + 1;

      return await this.userRepository.save({
        id,
        lastFailureLogin: new Date(),
        numberOfWrongLogins: wrongLogins,
        isBlocked: false,
        blockDate:
          wrongLogins === 1 ? null : this.setUserBlockDate(wrongLogins),
      });
    } catch {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Something went wrong, try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async setUserSuccessLoginData({ id }: UserEntity) {
    try {
      return await this.userRepository.save({
        id,
        lastSuccessLogin: new Date(),
        numberOfWrongLogins: null,
        isBlocked: false,
        blockDate: null,
      });
        
    } catch(err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Something went wrong, try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleIpLoginFail(address: AddressEntity, ipAddress?: string) {
    if (!address) {
      return await this.addressRepository.save({
        ipAddress,
        lastFailureLogin: new Date(),
        lastSuccessLogin: null,
        isBlocked: false,
        blockDate: null,
        numberOfWrongLogins: 1,
      })
    } else {
      const { numberOfWrongLogins } = address;
      const wrongLogins =
        numberOfWrongLogins === 4
          ? numberOfWrongLogins
          : numberOfWrongLogins + 1;


      return await this.addressRepository.save({
        id: address?.id,
        ipAddress,
        lastFailureLogin: new Date(),
        numberOfWrongLogins: wrongLogins,
        isBlocked: wrongLogins === 4,
        blockDate:
          wrongLogins === 4 ? null : this.setIpBlockDate(wrongLogins),
      })

    }
  }

  async setIpSuccessLoginData(address: AddressEntity, ipAddress?: string) {
    if (!address) {
      return await this.addressRepository.save({
        ipAddress,
        lastFailureLogin: null,
        lastSuccessLogin: new Date(),
        isBlocked: false,
        blockDate: null,
        numberOfWrongLogins: null,
      })

    } else {
      return await this.addressRepository.save({
        id: address.id,
        ipAddress,
        lastFailureLogin: null,
        lastSuccessLogin: new Date(),
        isBlocked: false,
        blockDate: null,
        numberOfWrongLogins: null,
      })

    }
  }


  public setUserBlockDate(numberOfWrongLogins: number) {
    switch (numberOfWrongLogins) {
      case 1: {
        return new Date();
      }
      case 2: {
        return new Date(new Date().getTime() + 2 * 1000);
      }
      case 3: {
        return new Date(new Date().getTime() + 5 * 1000);
      }
      default: {
        return new Date(new Date().getTime() + 2 * 60000);
      }
    }
  }

  public setIpBlockDate(numberOfWrongLogins: number) {
    switch (numberOfWrongLogins) {
      case 2: {
        return new Date(new Date().getTime() + 2 * 1000);
      }
      case 3: {
        return new Date(new Date().getTime() + 5 * 1000);
      }
      default: {
        return new Date();
      }
    }
  }

  public generateJWT(user) {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
      id: user.id,
      email: user.email,
      exp: exp.getTime() / 1000,
    }, SECRET);
  };

  public buildUserRO(user: UserEntity) {
    const userRO = {
      id: user.id,
      password: user.password,
      email: user.email,
      bio: user.bio,
      token: this.generateJWT(user),
      image: user.image,
      isBlocked: user.isBlocked,
      blockDate: user.blockDate,
      lastSuccessLogin: user.lastSuccessLogin,
      lastFailureLogin: user.lastFailureLogin
    };

    return { user: userRO };
  }

  public decodePassword(item, oldPassword, password) {
    return CryptoAES.encrypt(CryptoAES.decrypt(item.password, oldPassword).toString(CryptoENC), password).toString()
  }

  public buildPassword(salt, password, type) {
    return type === 'SHA512' ? hasha(process.env.MASTER_KEY + salt + password, { algorithm: 'sha512' }) : crypto.createHmac('sha512', process.env.SECRET_KEY).update(password).digest('hex');
  }

  public generateHash() {
    return crypto.randomBytes(20).toString('hex');
  }

}
