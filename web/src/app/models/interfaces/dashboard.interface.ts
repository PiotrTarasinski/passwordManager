export interface ICredential {
  id: string;
  created: Date;
  updated: Date;
  url: string;
  description?: string;
  username: string;
  password: string;
  isShared?: boolean;
}

export interface IAddCredentialRequest {
  url: string;
  description: string;
  username: string;
  password: string;
}

export interface IShareCredentialRequest {
  passwordId: string;
  email: string;
}

export interface IEditCredentialRequest extends IAddCredentialRequest {
  id: string;
}

export interface IActionLog {
  id: string;
  passwordId: string;
  date: Date;
  oldUrl?: string;
  newUrl?: string;
  oldDescription?: string;
  newDescription?: string;
  oldUsername?: string;
  newUsername?: string;
  oldPassword?: string;
  newPassword?: string;
}
