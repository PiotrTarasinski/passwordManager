import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { UserActions, UserActionTypes } from './user.actions';

const initialState: IUserState = {
  isLoggedIn: localStorage.getItem('token') ? true : false,
  email: localStorage.getItem('email') || '',
  lastSuccessLogin: localStorage.getItem('lastSuccessLogin') || '',
  lastFailureLogin: localStorage.getItem('lastFailureLogin') || '',
  editMode: false,
};

export function userReducer(state: IUserState = initialState, action: UserActions) {
  switch (action.type) {
    case UserActionTypes.SignInSuccess:
      return { ...action.payload, editMode: false };

    case UserActionTypes.ToggleEditMode:
      return { ...state, editMode: !state.editMode };

    case UserActionTypes.LogoutSuccess:
      return { isLoggedIn: false };

    default:
      return state;
  }
}
