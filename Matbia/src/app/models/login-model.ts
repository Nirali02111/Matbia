import { KYC_LEVEL_LIST, KYC_VERIFICATION_STATUS } from './../enum/KYC';
export interface LoginModel {
  userName: string;
  password: string;
  recapcha: string;
}

export interface ResetPassword {
  entityId: string;
  newPassword: string;
  confirmNewPassword: string;
  currentPassword: string | null;
  reCaptcha: string;
  isOrgUser?: boolean;
}

export interface UserRegisterPayload {
  userName: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ssn: string;
  birthDate: string;
  email: string;
  phone: string;

  apt: string;
  timeZone: string;
  isKYCRequestRequired: boolean;
}

export interface SilaError {
  error: string;
  field: string;
}

export interface SilaHeader {
  Server: string;
  Date: string;
  Connection: string;
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Headers': string;
  Vary: string;
  'Content-Type': string;
  'Content-Length': string;
  Allow: string;
}

export interface SilaResponse {
  verificationUuid: string;
  reference: string;
  message: string;
  status: string;
  success: boolean;
}

export interface RegisterResponse {
  statusCode: number;
  data: {
    reference: string;
    message: string;
    status: string;
    success: boolean;
  };
  errors: Array<SilaError>;
  success: boolean;
  requestKYCResponse: SilaResponse;
  failedKYCCount: number;
  userHandle: string;
  // walletPrivateKey: string;
}

export interface VerificationHistoryObj {
  verificationId: string;
  reasons: Array<string>;
  tags: Array<string>;
  score: number;
  parentVerification: null;
  verificationStatus: KYC_VERIFICATION_STATUS;
  kycLevel: string;
  requestedAt: number;
  updatedAt: number;
}

export interface KYCCheckResponse {
  statusCode: number;
  headers: SilaHeader;
  data: {
    entityType: string;
    verificationStatus: KYC_VERIFICATION_STATUS;
    verificationHistory: Array<VerificationHistoryObj>;
    validKYCLevels: Array<KYC_LEVEL_LIST>;
    reference: string;
    message: string;
    status: string;
    success: boolean;
  };
  success: boolean;
}

export interface UploadDocumentResponse {
  statusCode: number;
  success: boolean;
  data: {
    message: string;
    status: string;
    success: boolean;
    referenceId: string;
    documentId: string;
  };
  errors: Array<SilaError>;
}

// Business Register

export interface BusinessRegister {
  businessHandle: string;
  businessName: string;
  businessType: string;
  businessWebsite: string;
  doingBusinessAs: string;
  naicsCode: number;
  phone: string;
  businessEmail: string;
  employerId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface BusinessUpdatePayload {
  orgHandle: string;
  businessType: string;
  naicsCode: number;
  businessWebsite: string;
  streetAddress1: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  updatedBy: number;
  email: string;
  phone: string;
  employerId: string;
  officePhone: string;
  displayName: string;
  orgJewishName: string;
}

export interface BusinessUpdateResponse {
  errors: Array<SilaError>;
  message: string;
  requestKYCResponse: SilaResponse;
  statusCode: number;
  success: boolean;
}
