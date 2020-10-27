import { createSelector } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';

const user = (state: IState) => state.user;

export const selectUser = createSelector(
  user,
    (state: IUserState) => state
);
