import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { parseStringPromise } from 'xml2js';

export interface USPSErrorObj {
  Description: string;
  HelpContext: string;
  HelpFile: string;
  Number: string;
  Source: string;
}
export interface AddressObj {
  Address2: string;
  City: string;
  State: string;
  Zip4: string;
  Zip5: string;
  ReturnText: string;
  Error: USPSErrorObj;
}

export interface AddressValidateResponse {
  Address: AddressObj;
}

export interface MailResponseData {
  AddressValidateResponse: AddressValidateResponse;
}

export interface MultipleAddressObj {
  ID: string;
  Address2: string;
  City: string;
  State: string;
  Zip4: string;
  Zip5: string;
  ReturnText: string;
  Error: USPSErrorObj;
}

export interface MultipleAddressValidateResponse {
  Address: Array<MultipleAddressObj>;
}

export interface MultipleMailResponseData {
  AddressValidateResponse: MultipleAddressValidateResponse;
}

@Injectable({
  providedIn: 'root',
})
export class USPSService {
  private addressErrorText = 'Address Not Found';
  private cityErrorText = 'Invalid City';
  private zipErrorText = 'Invalid Zip Code';
  private aptErrorText = 'such as an apartment, suite, or box number';

  private defaultErrorText =
    'The address you entered was found but more information is needed (such as an apartment, suite, or box number) to match to a specific address';

  private VALIDATEADDRESS_API_URL = 'https://production.shippingapis.com/ShippingAPI.dll?API=Verify';

  get APTRegExp(): RegExp {
    return new RegExp(/(apt)+/, 'gi');
  }

  constructor() {}

  isErrorOnAddress(description: string): boolean {
    return description.includes(this.addressErrorText);
  }

  isErrorOnApt(description: string): boolean {
    return description.includes(this.aptErrorText);
  }

  isErrorOnCity(description: string): boolean {
    return description.includes(this.cityErrorText);
  }

  isErrorOnZip(description: string): boolean {
    return description.includes(this.zipErrorText);
  }

  isErrorOnDefaultText(description: string): boolean {
    return description.includes(this.defaultErrorText);
  }

  isCityStateZipDifferent(
    cityObj: { city: string; uspsCity: string },
    stateObj: { state: string; uspsState: string },
    zipObj: { zip: string; uspsZip: string }
  ) {
    return (
      cityObj.city.toLowerCase() !== cityObj.uspsCity.toLowerCase() ||
      stateObj.state.toLowerCase() !== stateObj.uspsState.toLowerCase() ||
      zipObj.zip.toLowerCase() !== zipObj.uspsZip.toLowerCase()
    );
  }

  protected getAddressXMLNode(id: string, address: string, city: string, state: string, zip: string): string {
    return `<Address ID="${id}"><Address1></Address1><Address2>${address}</Address2><City>${city}</City><State>${state}</State><Zip5>${zip}</Zip5><Zip4></Zip4></Address>`;
  }

  public formateAddressValue(address: string): string {
    if (!address) {
      return '';
    }
    return address.replace('#', '');
  }

  public getSimpleAddressXMLNode(address: string, city: string, state: string, zip: string): string {
    return this.getAddressXMLNode('1', this.formateAddressValue(address), city, state, zip);
  }

  public getUniqAddressXMLNode(id: string, address: string, city: string, state: string, zip: string) {
    return this.getAddressXMLNode(id, address, city, state, zip);
  }

  public getAddressValidateRequestPayload(xmlsNodes: string): string {
    return `<AddressValidateRequest USERID="812DONAR5245">${xmlsNodes}</AddressValidateRequest>`;
  }

  public getAddressWithAPT(address: string, apt: string | null) {
    if (!apt) {
      return address;
    }

    if (!this.APTRegExp.test(apt)) {
      return `${address} ${apt}`;
    }

    const upperValue = apt.toUpperCase();

    const formattedStr = upperValue.replace(this.APTRegExp, '').trim();

    return `${address} APT ${formattedStr}`;
  }

  public removeAPTfromAddress(address: string) {
    if (!this.APTRegExp.test(address)) {
      return address;
    }

    const upperValue = address.toUpperCase();
    const strArray = upperValue.trim().split(this.APTRegExp);

    const formattedStr = strArray.map((val) => {
      return val.trim();
    });

    return formattedStr[0];
  }

  validateAddress(formdata: string): Observable<any> {
    return new Observable<any>((observer) => {
      fetch(this.VALIDATEADDRESS_API_URL + '&XML=' + formdata, {
        mode: 'cors',
        method: 'GET',
        headers: {
          Accept: 'text/xml',
        },
      })
        .then((res) => {
          return res.text();
        })
        .then((body) => {
          parseStringPromise(body, { ignoreAttrs: true, explicitArray: false })
            .then((result: MailResponseData) => {
              if (result.AddressValidateResponse.Address.Error) {
                observer.next({
                  isValid: false,
                  message: result.AddressValidateResponse.Address.Error.Description,
                  address: '',
                  city: '',
                  state: '',
                  zip: '',
                });
                observer.complete();
                return;
              }

              if (result.AddressValidateResponse.Address.ReturnText) {
                const tmpStr = result.AddressValidateResponse.Address.ReturnText.split(':');
                if (tmpStr.length !== 0) {
                  observer.next({
                    isValid: false,
                    message: tmpStr[1],
                    address: result.AddressValidateResponse.Address.Address2,
                    city: result.AddressValidateResponse.Address.City,
                    state: result.AddressValidateResponse.Address.State,
                    zip: result.AddressValidateResponse.Address.Zip5,
                  });
                  observer.complete();
                  return;
                } else {
                  observer.next({
                    isValid: false,
                    message: result.AddressValidateResponse.Address.ReturnText,
                    address: result.AddressValidateResponse.Address.Address2,
                    city: result.AddressValidateResponse.Address.City,
                    state: result.AddressValidateResponse.Address.State,
                    zip: result.AddressValidateResponse.Address.Zip5,
                  });
                  observer.complete();
                  return;
                }
              }

              observer.next({
                isValid: true,
                message: '',
                address: result.AddressValidateResponse.Address.Address2,
                city: result.AddressValidateResponse.Address.City,
                state: result.AddressValidateResponse.Address.State,
                zip: result.AddressValidateResponse.Address.Zip5,
              });
              observer.complete();
            })
            .catch(() => {
              observer.next({
                isValid: false,
                message: 'Invalid Request',
                address: '',
              });
              observer.complete();
            });
        })
        .catch((err) => observer.error(err));
    });
  }
}
