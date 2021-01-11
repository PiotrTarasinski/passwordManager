export interface UserData {
  email: string;
  token: string;
  isBlocked?: boolean;
  blockDate?: Date
}

export interface UserRO {
  user: UserData;
}