import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { User } from 'src/database/models/User';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private appService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.appService.findOne(username);
    const encryption = user.isPasswordKeptAsHash ? 'hmac' : 'sha512';
    if (
      user &&
      user.password === this.hashPassword(encryption, password, user.salt)
    ) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, id: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  hashPassword(
    encryption: 'sha512' | 'hmac',
    password: string,
    salt: string,
  ): string {
    const passwordString = salt + password + 'wIDmCexWa6';
    return encryption === 'hmac'
      ? crypto
          .createHmac('sha512', 'ja0Afw0k1kdazxc')
          .update(passwordString)
          .digest('hex')
      : crypto
          .createHash(encryption, { encoding: 'hex' })
          .update(passwordString)
          .digest('hex');
  }

  encodePassword(password: string, masterPassword: string): string {
    const key16 = CryptoJS.MD5(masterPassword).toString().substr(0, 16);

    const key = CryptoJS.enc.Utf8.parse(key16);
    const iv = CryptoJS.enc.Utf8.parse(key16);

    return CryptoJS.AES.encrypt(
      password, key, {
        keySize: 16,
        iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString();
  }

  decodePassword(encryptedPassword: string, masterPassword: string): string {
    const key16 = CryptoJS.MD5(masterPassword).toString().substr(0, 16);

    const key = CryptoJS.enc.Utf8.parse(key16);
    const iv = CryptoJS.enc.Utf8.parse(key16);

    return CryptoJS.AES.decrypt(
      encryptedPassword, key, {
        keySize: 16,
        iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8) 
  }
}
