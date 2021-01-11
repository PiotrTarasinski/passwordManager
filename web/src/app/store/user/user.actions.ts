import { Action } from '@ngrx/store';
import {
  ISignUpRequest,
  IChangePasswordRequest,
  ISignInRequest,
} from 'src/app/models/interfaces/app.interface';
import {
  IAddCredentialRequest, ICredentialsListResponse, IEditCredentialRequest
} from 'src/app/models/interfaces/dashboard.interface';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';

export enum UserActionTypes {
  SignUp = '[User] Sign Up',
  SignUpSuccess = '[User] Sign Up Success',
  SignUpError = '[User] Sign Up Error',

  SignIn = '[User] Sign In',
  SignInSuccess = '[User] Sign In Success',
  SignInError = '[User] Sign In Error',

  ChangePassword = '[User] Change Password',
  ChangePasswordSuccess = '[User] Change Password Success',
  ChangePasswordError = '[User] Change Password Error',

  Logout = '[User] Logout',
  LogoutSuccess = '[User] Logout Success',

  GetCredentials = '[Credential] Get User Credentials',
  GetCredentialsSuccess = '[Credential] Get User Credentials Success',
  GetCredentialsError = '[Credential] Get User Credentials Error',

  AddCredential = '[Credential] Add Credential',
  AddCredentialSuccess = '[Credential] Add Credential Success',
  AddCredentialError = '[Credential] Add Credential Error',

  EditCredential = '[Credential] Edit Credential',
  EditCredentialSuccess = '[Credential] Edit Credential Success',
  EditCredentialError = '[Credential] Edit Credential Error',

  RemoveCredential = '[Credential] Remove Credential',
  RemoveCredentialSuccess = '[Credential] Remove Credential Success',
  RemoveCredentialError = '[Credential] Remove Credential Error',
}

export class SignUp implements Action {
  readonly type = UserActionTypes.SignUp;

  constructor(public payload: ISignUpRequest) { }
}

export class SignUpSuccess implements Action {
  readonly type = UserActionTypes.SignUpSuccess;
}

export class SignUpError implements Action {
  readonly type = UserActionTypes.SignUpError;

  constructor(public payload: Error) { }
}

export class SignIn implements Action {
  readonly type = UserActionTypes.SignIn;

  constructor(public payload: ISignInRequest) { }
}

export class SignInSuccess implements Action {
  readonly type = UserActionTypes.SignInSuccess;

  constructor(public payload: IUserState) { }
}

export class SignInError implements Action {
  readonly type = UserActionTypes.SignInError;

  constructor(public payload: Error) { }
}

export class ChangePassword implements Action {
  readonly type = UserActionTypes.ChangePassword;

  constructor(public payload: IChangePasswordRequest) { }
}

export class ChangePasswordSuccess implements Action {
  readonly type = UserActionTypes.ChangePasswordSuccess;
}

export class ChangePasswordError implements Action {
  readonly type = UserActionTypes.ChangePasswordError;

  constructor(public payload: Error) { }
}

export class Logout implements Action {
  readonly type = UserActionTypes.Logout;
}

export class LogoutSuccess implements Action {
  readonly type = UserActionTypes.LogoutSuccess;
}

export class GetCredentials implements Action {
  readonly type = UserActionTypes.GetCredentials;
}

export class GetCredentialsSuccess implements Action {
  readonly type = UserActionTypes.GetCredentialsSuccess;

  constructor(public payload: ICredentialsListResponse) { }
}

export class GetCredentialsError implements Action {
  readonly type = UserActionTypes.GetCredentialsError;

  constructor(public payload: Error) { }
}

export class AddCredential implements Action {
  readonly type = UserActionTypes.AddCredential;

  constructor(public payload: IAddCredentialRequest) { }
}

export class AddCredentialSuccess implements Action {
  readonly type = UserActionTypes.AddCredentialSuccess;
}

export class AddCredentialError implements Action {
  readonly type = UserActionTypes.AddCredentialError;

  constructor(public payload: Error) { }
}

export class EditCredential implements Action {
  readonly type = UserActionTypes.EditCredential;

  constructor(public payload: IEditCredentialRequest) { }
}

export class EditCredentialSuccess implements Action {
  readonly type = UserActionTypes.EditCredentialSuccess;
}

export class EditCredentialError implements Action {
  readonly type = UserActionTypes.EditCredentialError;

  constructor(public payload: Error) { }
}

export class RemoveCredential implements Action {
  readonly type = UserActionTypes.RemoveCredential;

  constructor(public payload: string) { }
}

export class RemoveCredentialSuccess implements Action {
  readonly type = UserActionTypes.RemoveCredentialSuccess;
}

export class RemoveCredentialError implements Action {
  readonly type = UserActionTypes.RemoveCredentialError;

  constructor(public payload: Error) { }
}

export type UserActions =
  SignUp
  | SignUpSuccess
  | SignUpError
  | SignIn
  | SignInSuccess
  | SignInError
  | ChangePassword
  | ChangePasswordSuccess
  | ChangePasswordError
  | Logout
  | LogoutSuccess
  | GetCredentials
  | GetCredentialsSuccess
  | GetCredentialsError
  | AddCredential
  | AddCredentialSuccess
  | AddCredentialError
  | EditCredential
  | EditCredentialSuccess
  | EditCredentialError
  | RemoveCredential
  | RemoveCredentialSuccess
  | RemoveCredentialError;
