export interface ICredential {
  id: string;
  userId: string;
  url: string;
  description?: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAddCredentialRequest {
  url: string;
  description: string;
  username: string;
  password: string;
  key: string;
}

export interface IEditCredentialRequest extends IAddCredentialRequest {
  id: string;
}

export interface ICredentialsListResponse {
  passwords: ICredential[];
}
