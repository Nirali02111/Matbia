import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenStatus } from '@enum/Token';
import { Observable } from 'rxjs';

export type TokenStatusType =
  | TokenStatus.GENERATED
  | TokenStatus.PROCESSED
  | TokenStatus.EXPIRED
  | TokenStatus.VOIDED
  | TokenStatus.REDEEMED;

export interface TokenPayloadType {
  tokenAmount: number;
  tokenNumber: string | null;
}

export interface ProcessTokenPayload {
  orgHandle: string;
  tokens: Array<TokenPayloadType>;
}

export interface ValidateTokenPayload extends TokenPayloadType {
  orgHandle: string | null;
}

export interface ValidateTokenResponse {
  status: TokenStatusType;
  donorName: string | null;
  message: string | null;
}

export interface TokenProcessType {
  amount: number;
  tokenNumber: string;
  message: string;
}
export interface ProcessTokenResponse {
  status: string | null;
  message: string | null;
  processedTokensCount: number;
  processedTokensAmount: number | null;
  processed: Array<TokenProcessType>;
  notProcessedTokensCount: number;
  notProcessedTokensAmount: number | null;
  notProcessed: Array<TokenProcessType>;
}

export interface ProcessTokenObj extends TokenPayloadType {
  status: TokenStatusType;
  donorName: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationTokenAPIService {
  private version = 'v1/';

  private ORG_TOKEN_ROUTE = `${this.version}OrgTokens`;

  private ORG_TOKEN_VALIDATE_URL = this.ORG_TOKEN_ROUTE + '/ValidateToken';

  private ORG_PROCESS_TOKEN_URL = this.ORG_TOKEN_ROUTE + '/ProcessTokens';

  constructor(private http: HttpClient) {}

  process(apiData: ProcessTokenPayload): Observable<ProcessTokenResponse> {
    return this.http.post<ProcessTokenResponse>(this.ORG_PROCESS_TOKEN_URL, apiData).pipe((response) => {
      return response;
    });
  }

  validate(apiData: ValidateTokenPayload): Observable<ValidateTokenResponse> {
    return this.http.post<ValidateTokenResponse>(this.ORG_TOKEN_VALIDATE_URL, apiData).pipe((response) => {
      return response;
    });
  }
}
