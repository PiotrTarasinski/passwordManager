export interface IUserState {
  isLoggedIn: boolean;
  email?: string;
  password?: string;
  lastSuccessLogin?: string;
  lastFailureLogin?: string;
}
