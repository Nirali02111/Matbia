import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';

import { RepostItemObj } from './API/dynamic-grid-report.service';
import { SortColumn, SortDirection } from './directive/ngbd-sortable-header.directive';
import { BaseState } from 'src/app/models/panels';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';
import { HttpClient } from '@angular/common/http';

interface SearchResult {
  rows: RepostItemObj[];
  total: number;
}

interface State extends BaseState {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

function sort(countries: RepostItemObj[], column: SortColumn, direction: string): RepostItemObj[] {
  if (direction === '' || column === '') {
    return countries;
  } else {
    return [...countries].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

@Injectable()
export class MatbiaQueryReportService {
  private _initialize$ = new BehaviorSubject<boolean>(false);
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _headers$ = new BehaviorSubject<string[]>([]);
  private _rows$ = new BehaviorSubject<RepostItemObj[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private arrayList: Array<RepostItemObj> = [];

  private _state: State = {
    page: 1,
    pageSize: 20,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private pipe: SearchPipe, private http: HttpClient) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._rows$.next(result.rows);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  set TableHeaders(list: Array<RepostItemObj>) {
    const headers: string[] = [];
    list.forEach((value) => {
      Object.keys(value).forEach((key) => {
        if (!headers.find((header) => header === key)) {
          headers.push(key);
        }
      });
    });
    this._headers$.next(headers);
  }

  set ListData(list: Array<RepostItemObj>) {
    this.arrayList = list;
    this.TableHeaders = list;
    this._initialize$.next(true);
    this._search$.next();
  }

  get headers$() {
    return this._headers$.asObservable();
  }

  get rows$() {
    return this._rows$.asObservable();
  }

  get total$() {
    return this._total$.asObservable();
  }

  get initialize$() {
    return this._initialize$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({ page });
  }

  get pageSize() {
    return this._state.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _searchAndSort(): Array<any> {
    const { searchTerm, sortColumn, sortDirection } = this._state;

    const list = this.getMainList();

    // 1. sort
    const rows = sort(list, sortColumn, sortDirection);

    // 2. Filter
    const transactions: any[] = this.pipe.transform(rows, searchTerm);

    return transactions;
  }

  private _applyPagination(list: any[]): Observable<SearchResult> {
    const { page, pageSize } = this._state;
    const total = list.length;
    const rows = list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ rows, total });
  }

  private _search(): Observable<SearchResult> {
    // For View Apply search and sort
    const transactions: any[] = this._searchAndSort();

    // 3. paginate
    return this._applyPagination(transactions);
  }

  /**
   * Check and filter transactions filter
   * @returns Array
   */
  private getMainList() {
    const data = this.arrayList;

    return data;
  }

  private getFilename(name: string): string {
    let filename = `${name}_${moment(new Date()).format('YYYY-MM-DDTHH:mm')}.xlsx`;
    filename = filename.trim();
    filename = filename.replace(/ /g, '_');
    return filename;
  }

  exportData(reportName: string) {
    const data = this._searchAndSort();
    if (data.length === 0) {
      return;
    }

    const filename = this.getFilename(reportName);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, { cellStyles: true });

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const excelData: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(excelData, filename);
  }

  openPDF(fileUrl: string) {
    window.open(fileUrl, '_blank');
  }
}
