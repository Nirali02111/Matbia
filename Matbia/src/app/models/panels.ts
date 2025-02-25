import { SilaError } from './login-model';

export interface GetDonorTransactionPayload {
  userHandle: string;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface DonorTransactionObj {
  transactionId: number;
  encryptedTransId: string;
  amount: number;
  completedDate: string | null;
  transDate: string;
  transType: string;
  transStatus: string;
  collector: string;
  source: string;
  method: string | null;
  cardLast4Digit: string | null;
  balance: number;
  note: string | null;
  encryptedEntityID: number | null;
  organization: string;
  organizationId: string | null;
  orgAddress: string;
  orgLogo: string | null;
  user: string;
  depositAvailable: string | null;
  phoneNum: string | null;
  scheduleNum: number | null;
  campaignName: string | null;
  batchNum: number | null;
  refNum: string | null;

  aliasExternalID: string | null;
  cardNum: string | null;
  bookNumber: string | number | null;

  tokenBookDetails?: {
    totalAmount: number;
    totalCount: number;

    processAmount?: number;
    processCount?: number;

    voidedAmount?: number;
    voidedCount?: number;

    remainingAmount?: number;
    remainingCount?: number;
    balance?: number;
    tokenBookList: Array<DonorTransactionObj>;
  };

  createdDate: string | null;
}

export interface GetOrganizationTransactionPayload {
  orgHandle: string;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface OrganizationTransactionObj {
  transactionId: number;
  amount: number;
  completedDate: string;
  transDate: string;
  transType: string;
  transStatus: string;
  collector: string;
  source: string;
  method: string;
  cardLast4Digit: string | null;
  balance: number;
  encryptedTransId: string;
  campaignName: string | null;
  destination: string;
  error: string | null;
  phoneNum: string | null;

  batchNum: number | null;
  sortOrder?: number | null;
}

export interface GatewayResponse {
  reference: string;
  descriptor: string;
  referenceId: string;
  destinationAddress: string | null;
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
}

export interface DonationRequestObj {
  amount: number;
  donationRequestId: number;
  donorId: number;
  orgId: number;
  donorFirstName: string;
  donorLastName: string;
  orgName: string | null;
  cardNum: string;
  status: string;
  createdDate: string;
  transDate: string | null;
  transId: string | null;
  method: string | null;
  collector: string | null;
  source: string | null;
  orgLogo: string | null;
}

export interface DonationRequestResponse {
  availableBalance: number;
  deposits: number;
  donations: number;
  presentBalance: number;
  donationRequests: Array<DonationRequestObj>;
  returnMessage: string;
}

export interface ScheduleObj {
  donorId: number;
  firstScheduleId: number;
  lastScheduleId: number;
  firstCreatedDate: string;
  nextScheduleDate: string;
  description: string;
  totalAmount: number;
  totalPaid: number;
  transType: string;
  repeatTimes: number;
  remaining: number;
  frequency: string;
  scheduleAmount: number;
  status: string;
  scheduleNum: number | null;
}

export interface DonorScheduleResponse {
  donorSchedules: Array<ScheduleObj> | null;
  availableBalance: number;
  presentBalance: number;
  deposits: number;
  donations: number;
  returnMessage: string;
}

export interface OrgScheduleResponse {
  orgSchedules: Array<ScheduleObj>;
  availableBalance: number;
  presentBalance: number;
  fundingBalance: number;
  donations: number;
}

export interface RecurringObj {
  count: number;
  amount: number;
  frequency: number;
  scheduleDate: string;
}

export interface BaseState {
  page: number;
  pageSize: number;
  searchTerm: string;
}

export interface SearchResult<T> {
  rows: T[];
  total: number;
}

export interface TokensObj {
  amount: number;
  bookNum?: number;
  expDate: string;
  generatedDateTime: string;
  status: string;
  tokenId: number;
  tokenNum: string;
}

export interface NewTokensObj {
  amount: number;
  expDate: string;
  generatedDateTime: string;
  status: string;
  tokenID: number;
  tokenNumber: number;
}
