import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { UserActions, UserActionTypes } from './user.actions';

const initialState: IUserState = {
  isLoggedIn: localStorage.getItem('token') ? true : false,
  username: localStorage.getItem('username') || '',
  password: localStorage.getItem('password') || '',
};

export function userReducer(state: IUserState = initialState, action: UserActions) {
  switch (action.type) {
    case UserActionTypes.SignInSuccess:
      return { isLoggedIn: true, ...action.payload };

    case UserActionTypes.LogoutSuccess:
      return { isLoggedIn: false };

    default:
      return state;
  }
}
