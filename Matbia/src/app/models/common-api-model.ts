import { SilaError, SilaHeader, SilaResponse } from './login-model';

export interface KYCDocumentType {
  name: string;
  label: string;
  identityType: string;
}

export interface BusinessType {
  requiresCertification: boolean;
  uuid: string;
  name: string;
  label: string;
}

export interface NAICObj {
  code: number;
  subcategory: string;
}

export interface NaicsCategories {
  [name: string]: Array<NAICObj>;
}

export interface BusinessRole {
  uuid: string;
  name: string;
  label: string;
}

export interface IndividualEntitiy {
  handle: string;
  full_name: string;
  created: number;
  status: boolean;
  blockchainAddresses: Array<string>;
}

export interface BusinessEntitiy {
  uuid: string;
  businessType: string;
  dba: string;
  handle: string;
  full_name: string;
  created: number;
  status: boolean;
  blockchainAddresses: Array<string>;
}

export interface PaginationObj {
  returnedCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
export interface EntitiyList {
  statusCode: number;
  data: {
    success: boolean;
    entities: {
      individuals: Array<IndividualEntitiy>;
      businesses: Array<BusinessEntitiy>;
    };
    pagination: PaginationObj;
  };
  success: boolean;
}

export interface LinkMemberData {
  userHandle: string;
  businessHandle: string;
  businessRole?: BusinessRole;
  description: string;
  ownershipStake: number;
}

export interface LinkMemberResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  data: {
    message: string;
    status: string;
    success: boolean;
    reference: string;
    role: string;
    details: string;
    verificationUuid: string;
  };
}

export interface KYBResponse {
  statusCode: number;
  headers: SilaHeader;
  data: SilaResponse;
  success: boolean;
}

export interface CertifyBeneficialOwnerRequest {
  adminUserHandle: string;
  businessHandle: string;
  memberHandle: string;
}

export interface CertifyBusinessRequest {
  adminUserHandle: string;
  businessHandle: string;
}

export interface CertifyBeneficialOwnerResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
}

export interface CertifyBusinessResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
}

export interface BusinessEntity {
  createdEpoch: number;
  created: string;
  birthdate: string;
  entityName: string;
  lastName: string;
  firstName: string;
  businessUuid: string;
  businessType: string;
  naicsCode: number;
  naicsCategory: number;
  naicsSubcategory: number;
  businessWebsite: string;
  doingBusinessAs: string;
}

export interface AddressEntitiy {
  addedEpoch: number;
  modifiedEpoch: number;
  added: string;
  modified: string;
  uuid: string;
  country: string;
  city: string;
  addressAlias: string;
  streetAddress1: string;
  streetAddress2: string;
  state: string;
  postalCode: string;
  nickname: string;
}

export interface IdentityEntitiy {
  addedEpoch: number;
  modifiedEpoch: number;
  added: string;
  modified: string;
  uuid: string;
  identityNumber: string;
  identityType: string;
}

export interface EmailEntitiy {
  addedEpoch: number;
  modifiedEpoch: number;
  added: string;
  modified: string;
  uuid: string;
  email: string;
}

export interface MembershipEntitiy {
  businessHandle: string;
  entityName: string;
  role: string;
  details: string;
  ownershipStake: number;
  certificationToken: string;
}

export interface PhoneEntitiy {
  addedEpoch: number;
  modifiedEpoch: number;
  added: string;
  modified: string;
  uuid: string;
  phone: string;
  smsConfirmationRequested: boolean;
  smsConfirmed: boolean;
  primary: boolean;
}

export interface BusinessGetEntitiyResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  data: {
    success: boolean;
    userHandle: string;
    entityType: string;
    entity: BusinessEntity;
    addresses: Array<AddressEntitiy>;
    identities: Array<IdentityEntitiy>;
    emails: Array<EmailEntitiy>;
    phones: Array<PhoneEntitiy>;
    memberships: Array<MembershipEntitiy>;
  };
}

export interface InstitutionObj {
  name: string;
  officeCode: null;
  routingNumber: null;
  recordTypeCode: null;
  changeDate: null;
  newRoutingNumber: null;
  address: {
    country: string;
    city: string;
    addressAlias: null;
    streetAddress1: null;
    streetAddress2: null;
    state: string;
    postalCode: string;
    nickname: null;
    addedEpoch: number;
    modifiedEpoch: number;
    added: null;
    modified: null;
    uuid: null;
  };
  phone: string;
  institutionStatusCode: null;
  dataViewCode: null;
  products: Array<string>;
}

export interface TransactionRecurrenceObj {
  id: number;
  name: string;
  description: string;
}

export interface MerchantObj {
  merchantId: number;
  name: string;
  merchantIcon: string | null;
  midNum: number | null;
  isDonary: boolean;
  isCardknox: boolean;
  isOther: boolean;
}
