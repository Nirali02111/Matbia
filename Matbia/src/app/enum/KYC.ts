export enum KYC_VERIFICATION_STATUS {
  UNVERIFIED = 'unverified',
  PASSED = 'passed',
  PENDING = 'pending',
  REVIEW = 'review',
  FAILED = 'failed',
  MEMBER_UNVERIFIED = 'member_unverified',
  MEMBER_FAILED = 'member_failed',
  MEMBER_REVIEW = 'member_review',
  MEMBER_PENDING = 'member_pending',
  DOCUMENTS_REQUIRED = 'documents_required',
  DOCUMENTS_RECEIVED = 'documents_received',
  WEBHOOK_PENDING = 'webhook_pending',
}

export enum KYC_LEVEL_LIST {
  'DEFAULT',
  'DOC_KYC',
  'DOC_KYC_BETA',
  'INSTANT-ACH',
  'KYC-LITE',
  'NONE',
  'RECEIVE_ONLY',
}

export enum KYC_LEVEL {
  DOC_KYC = 'DOC_KYC',
  KYC_LITE = 'KYC-LITE',
}

/**
 * For information
 * https://docs.silamoney.com/docs/triaging-kyc-failures
 */

export enum KYC_FAILED_TAGS {
  NAME_MISMATCH = 'Name Mismatch',
  NAME_NOT_VERIFIED = 'Name Not Verified',

  DOB_MISKEY = 'DOB Miskey',
  DOB_NOT_VERIFIED = 'DOB Not Verified',

  ADDRESS_NOT_MATCHED = 'Address Not Matched',
  ADDRESS_NOT_VERIFIED = 'Address Not Verified',

  SSN_MISKEY = 'SSN Miskey',
  SSN_NOT_VERIFIED = 'SSN Not Verified',

  FRAUD_WARNING = 'Fraud Warning',
  DENIED_FRAUD = 'Denied Fraud',
  FRAUD_RISK = 'Fraud Risk',
  FRAUD_REVIEW = 'Fraud Review',
}
