import { HashAlgorithmEnum } from '../enums/hashAlgorithm.enum';

export interface IEnvironment {
  production: boolean;
}

export interface ISignUpRequest {
  username: string;
  password: string;
  encryption: HashAlgorithmEnum;
}

export interface IUserData {
  username: string;
  password: string;
}

export interface ISignInResponse {
  token: string;
}

export interface IChangePasswordRequest {
  oldPassword: string;
  password: string;
  encryption: HashAlgorithmEnum;
}
