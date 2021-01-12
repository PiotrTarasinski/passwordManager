export interface ICredential {
  id: string;
  created: Date;
  updated: Date;
  url: string;
  description?: string;
  username: string;
  password: string;
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
