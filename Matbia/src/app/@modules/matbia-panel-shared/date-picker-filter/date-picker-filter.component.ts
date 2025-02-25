import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import moment from 'moment';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { shakeTrigger } from '@commons/animations';
import { CalendarCustomHeaderComponent } from 'src/app/@theme/calendar-custom-header/calendar-custom-header.component';

interface yearObj {
  fromDate: any;
  toDate: any;
  label: string;
}

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-date-picker-filter',
  templateUrl: './date-picker-filter.component.html',
  styleUrls: ['./date-picker-filter.component.scss'],
  imports: [SharedModule],
  animations: [shakeTrigger],
  viewProviders: [],
})
export class DatePickerFilterComponent implements OnInit, AfterViewInit {
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective!: DaterangepickerDirective;

  @Input() htmlId = 'dropdownMenuButton1';

  @Input() isShowLabel = true;

  @Input() rootClass = 'filter';

  @Input() defaultSelected = '3';

  @Input() isCustomModal = false;

  @Input() allowLegalYearSelection = true;

  @Output() filtered = new EventEmitter();

  @Output() dropdownToggle = new EventEmitter();

  @ViewChild('mainDrp') mainDrpButton!: ElementRef<HTMLButtonElement>;
  filterAction!: UntypedFormGroup;
  customFilterAction!: UntypedFormGroup;

  inAnimation = false;
  // Date-range picker related properties
  @Input() open = 'center';
  drop = 'down';
  showClearButton = false;
  alwaysShowCalendars = true;
  showRangeLabelOnInput = true;
  placeholder = 'Select Date Range';
  showCustomRangeLabel = false;
  linkedCalendars = false;
  yearName: string = '';
  locale: any = {};

  selectYear: yearObj | null = null;
  // listOfYears: Array<yearObj> = [];

  listOfYears = signal<yearObj[]>([]);

  showYearDrp = signal<boolean>(false);
  range: FormGroup<any> = new FormGroup({});
  modalRef!: NgbModalRef;
  isMobile: boolean = false;

  get selectedDatesDrp() {
    return this.filterAction.get('selectedDatesDrp');
  }

  get selectedDates() {
    return this.filterAction.get('selectedDates');
  }

  get CustomFromDate() {
    return this.customFilterAction.get('fromDate');
  }

  get CustomToDate() {
    return this.customFilterAction.get('toDate');
  }

  get optionOneId() {
    return `${this.htmlId}-opt-1`;
  }

  get optionTwoId() {
    return `${this.htmlId}-opt-2`;
  }

  get optionThreeId() {
    return `${this.htmlId}-opt-3`;
  }

  get optionFourId() {
    return `${this.htmlId}-opt-4`;
  }

  get optionFiveId() {
    return `${this.htmlId}-opt-5`;
  }

  get optionSixId() {
    return `${this.htmlId}-opt-6`;
  }

  readonly customHeaderComponent = CalendarCustomHeaderComponent;

  constructor(private fb: UntypedFormBuilder, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.isMobile = screen.width < 768;

    if (this.allowLegalYearSelection) {
      this.getAllYears();
    }

    const getInit = this.getPickerVal(this.defaultSelected);

    this.customFilterAction = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
    });

    if (getInit) {
      this.filterAction = this.fb.group({
        selectedDates: this.fb.control({
          fromDate: getInit.fromDate,
          toDate: getInit.toDate,
        }),

        selectedDatesDrp: this.fb.control(this.defaultSelected),
      });
    } else {
      this.filterAction = this.fb.group({
        selectedDates: this.fb.control({
          fromDate: moment(new Date()).subtract(29, 'days'),
          toDate: moment(new Date()),
        }),

        selectedDatesDrp: this.fb.control(this.defaultSelected),
      });
    }

    this.selectedDatesDrp?.valueChanges.subscribe((val) => {
      const getVal = this.getPickerVal(val);

      if (getVal) {
        this.selectedDates?.patchValue({
          fromDate: getVal.fromDate,
          toDate: getVal.toDate,
        });
        this.emitValue();
      }
    });
  }

  ngAfterViewInit(): void {
    let myDropdown = document.getElementById(this.htmlId);

    myDropdown?.addEventListener('show.bs.dropdown', () => {
      this.dropdownToggle.emit(true);
    });

    myDropdown?.addEventListener('hide.bs.dropdown', () => {
      this.dropdownToggle.emit(false);
    });

    this.pickerDirective.startDateChanged.subscribe(() => {
      this.pickerDirective.picker.applyBtn.disabled = true;
    });
    this.pickerDirective.endDateChanged.subscribe(() => {
      this.pickerDirective.picker.applyBtn.disabled = false;
    });
  }

  /**
   * Calculate number of years from 2022 to current year
   */
  private getAllYears() {
    const noOfYears = Number(moment().startOf('year').format('YYYY')) - 2022;

    for (let index = 0; index <= noOfYears; index++) {
      this.listOfYears.update(() => [
        ...this.listOfYears(),
        {
          fromDate: moment().subtract(index, 'years').startOf('year'),
          toDate: moment().subtract(index, 'years').endOf('year'),
          label: moment().subtract(index, 'years').startOf('year').format('YYYY'),
        },
      ]);
    }
  }

  CalenderFocus() {
    this.pickerDirective.open();
  }

  datesUpdated(_event: any) {
    this.selectedDatesDrp?.patchValue('6');
    this.emitValue();
  }

  emitValue() {
    const value = this.selectedDates?.value;

    const fromDate = !value.fromDate ? null : value.fromDate.format('YYYY-MM-DD');
    const toDate = !value.toDate ? null : value.toDate.format('YYYY-MM-DD');
    const selectedDatesDrp = this.selectedDatesDrp?.value;
    this.filtered.emit({
      fromDate,
      toDate,
      selectedDatesDrp,
    });
  }

  getPickerVal(val: string) {
    if (val && val === '1') {
      return {
        fromDate: moment(new Date()).startOf('day'),
        toDate: moment(new Date()).endOf('day'),
      };
    }

    if (val && val === '2') {
      return {
        fromDate: moment(new Date()).subtract(6, 'days'),
        toDate: moment(new Date()),
      };
    }

    if (val && val === '3') {
      return {
        fromDate: moment(new Date()).subtract(29, 'days'),
        toDate: moment(new Date()),
      };
    }

    if (val && val === '4') {
      return {
        fromDate: moment(new Date()).subtract(365, 'days'),
        toDate: moment(new Date()),
      };
    }

    if (val && val === '5') {
      return {
        fromDate: null,
        toDate: null,
      };
    }

    return false;
  }

  openModal(e: Event, content: any) {
    e.stopPropagation();
    e.preventDefault();
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'modal-filter-mobile ',
      modalDialogClass: 'modal-dialog-centered',
      fullscreen: 'md',
    });
  }

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  onCustomFilter(modal: any) {
    if (this.customFilterAction.invalid) {
      this.triggerAnimation();
      return;
    }

    let fromDate = this.customFilterAction.get('fromDate')?.value;
    let toDate = this.customFilterAction.get('toDate')?.value;

    let startDate, endDate;

    if (fromDate) {
      startDate = fromDate.endDate ? fromDate.endDate.toDate() : fromDate;
    }
    if (toDate) {
      endDate = toDate.endDate ? toDate.endDate.toDate() : toDate;
    }

    /**
     * Note: https://momentjs.com/docs/#/manipulating/utc/
     * need to convert to UTC by ignoring timezone
     */
    // console.log(moment.parseZone(fromDate.toDate()).utc(true).toISOString());
    // console.log(moment.parseZone(endDate.toDate()).utc(true).toISOString());

    this.filterAction.patchValue({
      selectedDates: {
        fromDate: moment.parseZone(startDate).utc(true),
        toDate: moment.parseZone(endDate).utc(true),
      },
    });

    this.filterAction.updateValueAndValidity();
    this.datesUpdated(false);
    modal.dismiss();
  }

  onYearDrpClick() {
    this.showYearDrp.update((val) => !val);
  }

  onSelectYear(item: yearObj) {
    this.selectedDatesDrp?.patchValue('7');
    this.yearName = item.label;
    this.selectedDates?.patchValue({
      fromDate: item.fromDate,
      toDate: item.toDate,
    });
    this.mainDrpButton.nativeElement.click();
    this.emitValue();
  }

  closeModal() {
    this.modalRef.close();
  }

  /**
   * handles logic for...
   * setting from date and to date values from datepicker.
   * toggle classes for start date, end date and dates between them
   * @param date selected date
   */
  onSelect(date: Date | null) {
    const fromDateControl = this.CustomFromDate;
    const toDateControl = this.CustomToDate;
    const formattedDate = date ? moment(date).format('MM/DD/yyyy') : null;
    const elements = document.querySelectorAll('button.mat-calendar-body-cell');

    const resetSelection = () => {
      fromDateControl?.setValue(formattedDate);
      toDateControl?.setValue(null);
      ['start-range', 'end-range', 'in-range'].forEach((rangeClass) => {
        document.querySelectorAll(`.${rangeClass}`).forEach((element) => element.classList.remove(rangeClass));
      });
    };

    const updateEndDate = () => {
      if (moment(date).isAfter(moment(fromDateControl?.value))) {
        toDateControl?.setValue(formattedDate);
      } else {
        toDateControl?.setValue(fromDateControl?.value);
        fromDateControl?.setValue(formattedDate);
      }
    };

    if (!fromDateControl?.value || (fromDateControl?.value && toDateControl?.value)) {
      resetSelection();
    } else if (fromDateControl?.value && !toDateControl?.value) {
      updateEndDate();
    }

    if (fromDateControl?.value && toDateControl?.value) {
      const startDate = moment(fromDateControl?.value, 'MM/DD/yyyy');
      const endDate = moment(toDateControl?.value, 'MM/DD/yyyy');

      elements.forEach((element) => {
        const checkDate = moment(element.ariaLabel);
        const isBetween = checkDate.isBetween(startDate, endDate, undefined, '[]');

        element.classList.toggle('start-range', checkDate.isSame(startDate));
        element.classList.toggle('end-range', checkDate.isSame(endDate));
        element.classList.toggle('in-range', isBetween);
      });
    }
  }

  isInRange(date: Date): boolean | null {
    return (
      this.CustomFromDate?.value &&
      this.CustomToDate?.value &&
      date >= this.CustomFromDate?.value &&
      date <= this.CustomToDate?.value
    );
  }

  // Add class to highlight selected date range
  dateClass() {
    return (date: Date) => {
      return this.isInRange(date) ? ['in-range'] : [''];
    };
  }

  removeDateValue(date: string) {
    if (date == 'startDate') this.CustomFromDate?.setValue(null);
    else if (date == 'endDate') this.CustomToDate?.setValue(null);
  }
}
