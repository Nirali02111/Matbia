import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProductItem {
  productId: number;
  title: string;
  description: string;
  price: number;
  sort: number;
  isDisplayed?: boolean;
  productCount: number;
  voucherCount: number;
  selectedVoucherAmount: number;
  tokenImage: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private version = 'v1/';

  private ORDER_URL = `${this.version}Order`;
  private GET_PRODUCTS_ORDER_URL = `${this.ORDER_URL}/GetProducts`;
  private CHECK_OUT_ORDER_URL = `${this.ORDER_URL}/CheckOut`;
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Array<ProductItem>> {
    return this.http.get<Array<ProductItem>>(this.GET_PRODUCTS_ORDER_URL).pipe((response) => {
      return response;
    });
  }
  checkOut(formdata: any): Observable<any> {
    return this.http.post<any>(this.CHECK_OUT_ORDER_URL, formdata).pipe((response) => {
      return response;
    });
  }
}
