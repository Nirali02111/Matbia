import { Component, ElementRef, EventEmitter, input, Input, OnInit, output, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SharedModule } from '@matbia/shared/shared.module';
import { isNumber, isString } from 'lodash-es';

@Component({
  selector: 'app-search-input',
  template: `
    <input
      type="text"
      class="form-control"
      [ngClass]="otherClass"
      (keydown.space)="allowSpace ? '' : $event.preventDefault()"
      (input)="applyFilter($event)"
      (keypress)="validateSearchText($event)"
      [(ngModel)]="value"
      [placeholder]="placeholder"
      #intElm
    />

    <ng-content select="[searchIcon]"></ng-content>
  `,
  imports: [SharedModule],
})
export class SearchInputComponent implements OnInit {
  public value = '';

  // tslint:disable-next-line: no-input-rename
  @Input('placeholder') placeholder = 'Search';

  // tslint:disable-next-line: no-input-rename
  @Input('class') otherClass = '';

  // tslint:disable-next-line: no-input-rename
  @Input('debounceTime') debounceTime = 400;
  @Output() changed = new EventEmitter();

  @Input() allowSpace = true;
  @Input() set searchByChanged(value: string | null) {
    if (value && this.value) {
      this.value = '';
      this.triggerSearch();
    }
  }

  isSearchByValidation = input<boolean>(false);
  searchBy = input<string | null>('');

  showTootlip = output<boolean>();

  @ViewChild('intElm', { static: true }) intElm!: ElementRef;

  private searchSub$ = new Subject<string>();
  errorMessage: string = '';
  constructor() {}

  ngOnInit(): void {
    this.searchSub$.pipe(debounceTime(this.debounceTime), distinctUntilChanged()).subscribe(() => {
      // this.value = filterValue.trim();
      this.triggerSearch();
    });
  }

  applyFilter(event: Event) {
    if (this.value.length >= 3 || this.value.length == 0)
      this.searchSub$.next((event.target as HTMLInputElement).value);
  }

  validateSearchText(event: any) {
    const value = event.key;
    if (this.searchBy() === 'name' || this.searchBy() === 'address') {
      if (isString(value) && isNumber(value)) return true;
    }

    if (this.searchBy() === 'EIN/Tax ID' || this.searchBy() === 'Phone Number') {
      if (isNaN(value)) {
        this.showTootlip.emit(true);
        return false;
      } else return true;
    }

    return true;
  }

  /**
   * call this from parent component
   */
  triggerSearch() {
    this.changed.emit(this.value);
  }

  /**
   * call this from parent component to set cursor
   */
  doFocus() {
    this.intElm.nativeElement.focus();
  }
}
