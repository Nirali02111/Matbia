import { SilaError } from './login-model';

export interface TimeLineObj {
  date: string;
  dateEpoch: number;
  status: string;
  usdStatus: string;
  tokenStatus: string;
}

export interface TransactionObj {
  userHandle: string;
  referenceId: string;
  transactionId: string;
  transactionHash: string;
  transactionType: string;
  silaAmount: number;
  bankAccountName: string;
  handleAddress: string;
  status: string;
  usdStatus: string;
  tokenStatus: string;
  created: string;
  lastUpdate: string;
  createdEpoch: number;
  lastUpdateEpoch: number;
  descriptor: string;
  descriptorAch: string;
  achName: string;
  processingType: string;
  destinationAddress: string;
  destinationHandle: string;
  timeLines: Array<TimeLineObj>;
  errorCode: string;
  errorMsg: string;
  returnCode: string;
  returnDesc: string;
  traceNumber: string;
  addenda: string;
}

export interface GetTransactionResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  transactions: Array<TransactionObj>;
}

export interface IssueSilaRequest {
  userHandle: string;
  amount: number;
  accountName: string;
  destinationHandle: string;
}

export interface IssueSilaResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  reference: string;
  descriptor: string;
  transactionId: string;
  destinationAddress: string;
}

export interface RedeemSilaRequest {
  userHandle: string;
  amount: number;
  accountName: string;
  destinationHandle: string;
}

export interface RedeemSilaResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  reference: string;
  descriptor: string;
  transactionId: string;
  destinationAddress: string;
}

export interface TransaferSilaRequest {
  userHandle: string;
  amount: number;
  accountName?: string;
  destinationHandle: string;
}

export interface TransferSilaResponse {
  statusCode: number;
  success: boolean;
  errors: Array<SilaError>;
  message: string;
  reference: string;
  descriptor: string;
  transactionId: string;
  destinationAddress: string;
}
