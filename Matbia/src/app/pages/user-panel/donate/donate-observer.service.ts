import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class DonateObserverService<T, T2> {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();

  private _rows$ = new BehaviorSubject<{ isBack: boolean; lastSearch: string | null; list: T[]; favoriteList: T2[] }>({
    lastSearch: '',
    list: [],
    isBack: false,
    favoriteList: [],
  });

  private arrayList: Array<T> = [];
  private arrayFavoriteList: Array<T2> = [];
  private lastSearchTerm: string | null = '';
  private isReturnToBack: boolean = false;

  constructor() {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._rows$.next({
          isBack: result.isBack,
          lastSearch: result.lastSearch,
          list: result.rows,
          favoriteList: result.favoriteRows,
        });
      });

    this._search$.next();
  }

  get rows$() {
    return this._rows$.asObservable();
  }

  set ListData(list: Array<T>) {
    this.arrayList = list;
    this._search$.next();
  }

  set FavoriteListData(list: Array<T2>) {
    this.arrayFavoriteList = list;
    this._search$.next();
  }

  set LastSearchTerm(value: string | null) {
    this.lastSearchTerm = value;
    this._search$.next();
  }

  set ReturningBack(value: boolean) {
    this.isReturnToBack = value;
    this._search$.next();
  }

  checkIsHaveData() {
    return this.lastSearchTerm && this.arrayList.length !== 0 && this.isReturnToBack;
  }

  _search() {
    let rows = this.arrayList;
    let favoriteRows = this.arrayFavoriteList;
    let lastSearch = this.lastSearchTerm;
    return of({ isBack: this.isReturnToBack, lastSearch, rows, favoriteRows: favoriteRows });
  }
}
