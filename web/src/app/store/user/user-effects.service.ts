import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { pluck, switchMap, catchError } from 'rxjs/operators';
import { EffectMessagingHandlerService } from 'src/app/shared/services/effect-messaging-handler.service';
import {
  UserActionTypes,
  SignInSuccess,
  SignInError
} from './user.actions';
import { setHttpParams } from 'src/app/utils/SetHttpParams';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private handler: EffectMessagingHandlerService,
  ) { }

  @Effect() SignIn$ = this.actions$.pipe(
    ofType(UserActionTypes.SignIn),
    pluck('payload'),
    switchMap((payload: any) => {
      const params = setHttpParams({ ...payload });
      return this.http.get('');
    }),
    switchMap((response: any) =>
      this.handler.handleSuccess(new SignInSuccess(response))
    ),
    catchError((err, caught) =>
      this.handler.handleError(
        caught,
        new SignInError(err),
      )
    ),
  );
}
