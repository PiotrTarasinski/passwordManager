import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { UserActions, UserActionTypes } from './user.actions';

const initialState: IUserState = {
  isLoggedIn: false,
};

export function userReducer(state: IUserState = initialState, action: UserActions) {
  switch (action.type) {

    default:
      return state;
  }
}
