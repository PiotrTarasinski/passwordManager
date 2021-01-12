export interface IUserState {
  isLoggedIn: boolean;
  email?: string;
  lastSuccessLogin?: string;
  lastFailureLogin?: string;
}
