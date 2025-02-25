import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ThemeService {
  searchFilterOpen = new Subject<{ isOpen: boolean }>();

  filterSectionObservable = new BehaviorSubject<{ section: string }>({ section: 'transaction' });

  accountObservable = new BehaviorSubject<{ type: string }>({ type: 'A1' });
  transactionTypeObservable = new BehaviorSubject<{ type: string }>({ type: 'AT' });
  timeTypeObservable = new BehaviorSubject<{ type: string }>({ type: 'T1' });
  amountTypeObservable = new BehaviorSubject<{ type: string }>({ type: 'A1' });

  searchInMatbiaObservable = new Subject<string>();

  constructor() {}

  writeMessage() {}

  public setFilterSection(value: string) {
    this.filterSectionObservable.next({ section: value });
  }

  public setAccountType(value: string) {
    this.accountObservable.next({ type: value });
  }

  public setTransactionType(value: string) {
    this.transactionTypeObservable.next({ type: value });
  }

  public setTimeType(value: string) {
    this.timeTypeObservable.next({ type: value });
  }

  public setAmountType(value: string) {
    this.amountTypeObservable.next({ type: value });
  }

  public openSearchAndFilterMenu() {
    this.searchFilterOpen.next({ isOpen: true });
  }

  public searchInMatbia(data: string) {
    this.searchInMatbiaObservable.next(data);
  }
}
