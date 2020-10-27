export interface RegisterUserDTO {
  username: string;
  password: string;
  encryption: 'sha512' | 'hmac';
}

export interface CreatePasswordDTO {
  url: string;
  description: string;
  username: string;
  password: string;
  key: string;
}

export interface EditPasswordDTO extends CreatePasswordDTO {
  id: number;
}

export interface UserCredentials {
  username: string;
  id: number;
}
