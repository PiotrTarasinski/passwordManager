export interface RegisterUserDTO {
  login: string;
  password: string;
  encryption: 'sha512' | 'hmac';
}

export interface CreatePasswordDTO {
  webAddress: string;
  description: string;
  login: string;
  password: string;
  key: string;
}

export interface EditPasswordDTO extends CreatePasswordDTO {
  id: number;
}

export interface UserCredentials {
  login: string;
  id: number;
}

export interface PaginationDTO {
  count: number;
  page: number;
}
