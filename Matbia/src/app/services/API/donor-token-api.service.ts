import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DonorTokenGeneratePayload {
  userHandle: string;
  tokens: Array<{
    tokenAmount: number;
    tokenCount: number;
    expDate: string;
  }>;
}

export interface GetTokensPayload {
  userHandle: string;
  fromDate: string;
  toDate: string;
}

export interface TokenObj {
  tokenId: number;
  tokenNum: string;
  amount: number;
  generatedDateTime: string;
  status: string;
  expDate: string;
  bookNum: number;
}

export interface TokenResponse {
  totalAmount: number;
  totalGenerated: number;
  totalProcessed: number;
  tokens: Array<TokenObj> | null;
}

interface alertPayload {
  userHandle: string;
  note: string;
  tokenIds: Array<number>;
}

export interface SendEmailPayload extends alertPayload {
  email: string;
}

export interface SendSMSPayload extends alertPayload {
  phone: string;
}

export interface VoidTokenPayload {
  userHandle: string;
  tokenIds: Array<number>;
}

export interface TokenVoidRequestPayload {
  userHandle: string;
  tokenIds: Array<number>;
  cancelReason: string;
}

export interface BookObj {
  bookID: number;
  bookNumber: number;
  bookName: string;
}

@Injectable({
  providedIn: 'root',
})
export class DonorTokenAPIService {
  private version = 'v1/';

  private DONOR_TOKEN_ROUTE = `${this.version}DonorTokens`;

  private DONOR_TOKEN_GENERATE_URL = this.DONOR_TOKEN_ROUTE + '/GenerateTokens';
  private DONOR_GET_TOKEN_URL = this.DONOR_TOKEN_ROUTE + '/GetTokens';

  private DONOR_SEND_EMAIL_URL = this.DONOR_TOKEN_ROUTE + '/SendEmail';

  private DONOR_SEND_SMS_URL = this.DONOR_TOKEN_ROUTE + '/SendSMS';

  private DONOR_VOID_TOKEN_URL = this.DONOR_TOKEN_ROUTE + '/VoidTokens';

  private DONOR_GET_BOOK_URL = this.DONOR_TOKEN_ROUTE + '/GetBooks';

  private DONOR_SUBMIT_TOKEN_VOID_REQUEST = this.DONOR_TOKEN_ROUTE + '/SubmitTokenVoidRequest';

  constructor(private http: HttpClient) {}

  generate(apiData: DonorTokenGeneratePayload): Observable<string> {
    return this.http.post<string>(this.DONOR_TOKEN_GENERATE_URL, apiData).pipe((response) => {
      return response;
    });
  }

  getTokens(apiData: GetTokensPayload): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.DONOR_GET_TOKEN_URL, apiData).pipe((response) => {
      return response;
    });
  }

  sendEmail(apiData: SendEmailPayload): Observable<string> {
    return this.http.post<string>(this.DONOR_SEND_EMAIL_URL, apiData).pipe((response) => {
      return response;
    });
  }

  sendSMS(apiData: SendSMSPayload): Observable<string> {
    return this.http.post<string>(this.DONOR_SEND_SMS_URL, apiData).pipe((response) => {
      return response;
    });
  }

  void(apiData: VoidTokenPayload): Observable<string> {
    return this.http.post<string>(this.DONOR_VOID_TOKEN_URL, apiData).pipe((response) => {
      return response;
    });
  }

  getBook(bookNumber: string, entityId: string): Observable<Array<BookObj>> {
    return this.http
      .get<Array<BookObj>>(this.DONOR_GET_BOOK_URL, {
        params: {
          bookNumber,
          entityId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  SubmitTokenVoidRequest(apiData: TokenVoidRequestPayload): Observable<string> {
    return this.http.post<string>(this.DONOR_SUBMIT_TOKEN_VOID_REQUEST, apiData).pipe((response) => {
      return response;
    });
  }
}
