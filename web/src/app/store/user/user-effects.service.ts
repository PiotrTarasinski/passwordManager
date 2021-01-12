import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { pluck, switchMap, catchError } from 'rxjs/operators';
import { EffectMessagingHandlerService } from 'src/app/shared/services/effect-messaging-handler.service';
import {
  UserActionTypes,
  SignInSuccess,
  SignInError,
  SignUpSuccess,
  SignUpError,
  GetCredentialsSuccess,
  GetCredentialsError,
  LogoutSuccess,
  AddCredentialSuccess,
  AddCredentialError,
  ChangePasswordError,
  ChangePasswordSuccess,
  Logout,
  RemoveCredentialSuccess,
  RemoveCredentialError,
  DecryptCredentialSuccess,
  DecryptCredentialError,
  EditCredentialSuccess,
  EditCredentialError,
  ShareCredentialSuccess,
  ShareCredentialError,
  GetActionLogSuccess,
  GetActionLogError
} from './user.actions';
import { setHttpParams } from 'src/app/utils/SetHttpParams';
import { ISignUpRequest, ISignInResponse, IChangePasswordRequest, ISignInRequest } from 'src/app/models/interfaces/app.interface';
import { combineLatest, of } from 'rxjs';
import { Router } from '@angular/router';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { Store, select } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { selectUser } from '../selectors/selectUser.selector';
import { IAddCredentialRequest, ICredential, IEditCredentialRequest, IShareCredentialRequest } from 'src/app/models/interfaces/dashboard.interface';

@Injectable()
export class UserEffects {

  user: IUserState;

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    private http: HttpClient,
    private handler: EffectMessagingHandlerService,
    private router: Router,
  ) {
    this.store.pipe(select(selectUser)).subscribe(res => {
      this.user = res;
    });
  }

  @Effect() SignUp$ = this.actions$.pipe(
    ofType(UserActionTypes.SignUp),
    pluck('payload'),
    switchMap((payload: ISignUpRequest) =>
      this.http.post('/api/users', payload)
    ),
    switchMap(() =>
      this.handler.handleSuccess(new SignUpSuccess())
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new SignUpError(err),
      )
    ),
  );

  @Effect() SignIn$ = this.actions$.pipe(
    ofType(UserActionTypes.SignIn),
    pluck('payload'),
    switchMap((payload: ISignInRequest) =>
      this.http.post('/api/users/login', payload)
    ),
    switchMap(({ user: { token, email, lastSuccessLogin, lastFailureLogin } }: ISignInResponse) => {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('lastSuccessLogin', lastSuccessLogin);
      localStorage.setItem('lastFailureLogin', lastFailureLogin);

      this.router.navigateByUrl('/dashboard');

      return this.handler.handleSuccess(
        new SignInSuccess({ isLoggedIn: true, email, lastSuccessLogin, lastFailureLogin }),
        'Logged In Successfully'
      );
    }
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new SignInError(err),
        'Invalid Credentials'
      )
    ),
  );

  @Effect() ChangePassword$ = this.actions$.pipe(
    ofType(UserActionTypes.ChangePassword),
    pluck('payload'),
    switchMap((payload: IChangePasswordRequest) => {
      const params = setHttpParams({ ...payload });
      return this.http.post('http://localhost:4000/auth/edit', params);
    }),
    switchMap(() => {
      this.store.dispatch(new Logout());

      return this.handler.handleSuccess(
        new ChangePasswordSuccess(),
        'Changed Password Successfully'
      );
    }
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new ChangePasswordError(err),
        'Invalid Credentials'
      )
    ),
  );

  @Effect() Logout$ = this.actions$.pipe(
    ofType(UserActionTypes.Logout),
    switchMap(() => {
      localStorage.clear();
      this.router.navigateByUrl('/login');
      return this.handler.handleSuccess(new LogoutSuccess());
    }),
  );

  @Effect() GetCredentials$ = this.actions$.pipe(
    ofType(UserActionTypes.GetCredentials),
    switchMap(() =>
      this.http.get('/api/password')
    ),
    switchMap((passwords: ICredential[]) =>
      this.handler.handleSuccess(new GetCredentialsSuccess(passwords))
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new GetCredentialsError(err),
      )
    ),
  );

  @Effect() AddCredential$ = this.actions$.pipe(
    ofType(UserActionTypes.AddCredential),
    pluck('payload'),
    switchMap((payload: IAddCredentialRequest) =>
      this.http.post('/api/password/create', payload)
    ),
    switchMap(() =>
      this.handler.handleSuccess(
        new AddCredentialSuccess(),
        'Credential Added Successfully'
      )
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new AddCredentialError(err),
      )
    ),
  );

  @Effect() DecryptCredential$ = this.actions$.pipe(
    ofType(UserActionTypes.DecryptCredential),
    pluck('payload'),
    switchMap((id: string) =>
      this.http.get(`/api/password/get/${id}`,)
    ),
    switchMap((response: ICredential) =>
      this.handler.handleSuccess(
        new DecryptCredentialSuccess(response),
      )
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new DecryptCredentialError(err),
      )
    ),
  );

  @Effect() ShareCredential$ = this.actions$.pipe(
    ofType(UserActionTypes.ShareCredential),
    pluck('payload'),
    switchMap((payload: IShareCredentialRequest) =>
      this.http.post('/api/password/share', payload)
    ),
    switchMap(() =>
      this.handler.handleSuccess(
        new ShareCredentialSuccess(),
        'Credential shared successfully'
      )
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new ShareCredentialError(err),
        "User with that email doesn't exist"
      )
    ),
  );

  @Effect() EditCredential$ = this.actions$.pipe(
    ofType(UserActionTypes.EditCredential),
    pluck('payload'),
    switchMap((payload: IEditCredentialRequest) =>
      this.http.post('/api/password/update', payload)
    ),
    switchMap(() =>
      this.handler.handleSuccess(
        new EditCredentialSuccess(),
        'Credential Edited Successfully'
      )
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new EditCredentialError(err),
        'Something went wrong'
      )
    ),
  );

  @Effect() RemoveCredential$ = this.actions$.pipe(
    ofType(UserActionTypes.RemoveCredential),
    pluck('payload'),
    switchMap((id: string) =>
      this.http.delete(`api/password/delete/${id}`)
    ),
    switchMap(() =>
      this.handler.handleSuccess(
        new RemoveCredentialSuccess(),
        'Removed Credential Successfully'
      )
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new RemoveCredentialError(err),
      )
    ),
  );

  @Effect() GetActionLog$ = this.actions$.pipe(
    ofType(UserActionTypes.GetActionLog),
    switchMap(() =>
      this.http.get('/api/password/passwordLog')
    ),
    switchMap((result: any[]) =>
      this.handler.handleSuccess(new GetActionLogSuccess(result))
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new GetActionLogError(err),
      )
    ),
  );

}
