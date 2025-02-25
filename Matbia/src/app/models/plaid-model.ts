import { SilaError } from './login-model';

export interface LinkTokenResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  linkToken: string;
}

export interface LinkAccountReq {
  userHandle: string;
  publicToken: string;
  accountName: string;
  accountId: string;
  plaidTokenType: string;
  accountType: string;
  accountNumber: string;
  isManualAccountLink: boolean;
}

export interface LinkAccountResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  reference: string;
  accountName: string;
  matchScore: number;
  accountOwnerName: string;
  entityName: string;
}

export interface EmailEntityObj {
  email: string;
  entityEmailId: number;
  isDefault: boolean;
  label: string;
}

export interface PhoneEntityObj {
  entityPhoneId: number;
  isDefault: boolean;
  label: string;
  phone: string;
}
