import { HashAlgorithmEnum } from '../enums/hashAlgorithm.enum';

export interface IEnvironment {
  production: boolean;
}

export interface ISignUpRequest {
  user: {
    email: string;
    password: string;
    type: HashAlgorithmEnum;
  }
}

export interface ISignInRequest {
  user: {
    email: string;
    password: string;
  }
}

export interface ISignInResponse {
  user: {
    token: string;
    lastSuccessLogin?: string;
    lastFailureLogin?: string;
  }
}

export interface IChangePasswordRequest {
  oldPassword: string;
  password: string;
  encryption: HashAlgorithmEnum;
}
