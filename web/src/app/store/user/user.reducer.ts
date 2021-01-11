import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { UserActions, UserActionTypes } from './user.actions';

const initialState: IUserState = {
  isLoggedIn: localStorage.getItem('token') ? true : false,
  email: localStorage.getItem('email') || '',
  password: localStorage.getItem('password') || '',
  lastSuccessLogin: localStorage.getItem('lastSuccessLogin') || '',
  lastFailureLogin: localStorage.getItem('lastFailureLogin') || '',
};

export function userReducer(state: IUserState = initialState, action: UserActions) {
  switch (action.type) {
    case UserActionTypes.SignInSuccess:
      return action.payload;

    case UserActionTypes.LogoutSuccess:
      return { isLoggedIn: false };

    default:
      return state;
  }
}
