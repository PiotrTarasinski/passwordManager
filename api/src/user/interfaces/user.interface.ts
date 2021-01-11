export interface UserData {
  email: string;
  token: string;
  bio: string;
  image?: string;
  isBlocked?: boolean;
  blockDate?: Date
}

export interface UserRO {
  user: UserData;
}