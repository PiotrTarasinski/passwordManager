import { Action } from '@ngrx/store';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';

export enum UserActionTypes {
  SignIn = '[User] Sign In',
  SignInSuccess = '[User] Sign In Success',
  SignInError = '[User] Sign In Error',
}

export class SignIn implements Action {
  readonly type = UserActionTypes.SignIn;

  constructor(public payload: any) { }
}

export class SignInSuccess implements Action {
  readonly type = UserActionTypes.SignInSuccess;

  constructor(public payload: any) { }
}

export class SignInError implements Action {
  readonly type = UserActionTypes.SignInError;

  constructor(public payload: Error) { }
}

export type UserActions =
  SignIn
  | SignInSuccess
  | SignInError;
