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
  RemoveCredentialError
} from './user.actions';
import { setHttpParams } from 'src/app/utils/SetHttpParams';
import { ISignUpRequest, ISignInResponse, IUserData, IChangePasswordRequest } from 'src/app/models/interfaces/app.interface';
import { combineLatest, of } from 'rxjs';
import { Router } from '@angular/router';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { Store, select } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { selectUser } from '../selectors/selectUser.selector';
import { IAddCredentialRequest, ICredentialsListResponse } from 'src/app/models/interfaces/dashboard.interface';
import { decryptPassword } from 'src/app/utils/DecryptPassword';

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
    switchMap((payload: ISignUpRequest) => {
      const params = setHttpParams({ ...payload });
      return this.http.post('http://localhost:4000/auth/register', params);
    }),
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
    switchMap((payload: IUserData) => {
      const params = setHttpParams({ ...payload });
      return combineLatest(
        this.http.post('http://localhost:4000/auth/login', params),
        of(payload));
    }),
    switchMap(([{ token }, { username, password }]: [ISignInResponse, IUserData]) => {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);

      this.router.navigateByUrl('/dashboard');

      return this.handler.handleSuccess(
        new SignInSuccess({ username, password }),
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
    switchMap(() => {
      return this.http.get('http://localhost:4000/password');
    }),
    switchMap(({passwords}: ICredentialsListResponse) => {
      passwords = passwords.map(el => ({...el, password: decryptPassword(el.password)}));
      return this.handler.handleSuccess(new GetCredentialsSuccess({passwords}));
    }
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
    switchMap((payload: IAddCredentialRequest) => {
      const params = setHttpParams({ ...payload, key: this.user?.password });
      return this.http.post('http://localhost:4000/password/create', params);
    }),
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

  @Effect() RemoveCredential$ = this.actions$.pipe(
    ofType(UserActionTypes.RemoveCredential),
    pluck('payload'),
    switchMap((id: string) => {
      return this.http.delete('http://localhost:4000/password', { params: { id } });
    }),
    switchMap(() => {
      return this.handler.handleSuccess(
        new RemoveCredentialSuccess(),
        'Removed Credential Successfully'
        );
    }
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new RemoveCredentialError(err),
      )
    ),
  );

}
