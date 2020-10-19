import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { userReducer } from './user/user.reducer';
import { IState } from '../models/interfaces/store';
import { UserEffects } from './user/user-effects.service';

export const reducers: ActionReducerMap<IState> = {
  user: userReducer,
};

export const metaReducers: MetaReducer<IState>[] = !environment.production ? [] : [];

export const AppEffects = [
  UserEffects,
];

