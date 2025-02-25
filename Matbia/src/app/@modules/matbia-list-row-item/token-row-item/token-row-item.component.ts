import { Component, EventEmitter, HostBinding, Input, Output, ViewChild, computed } from '@angular/core';
import { TokenObj } from '@services/API/donor-token-api.service';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { TokensPdfComponent } from '@matbia/matbia-panel-shared/tokens-pdf/tokens-pdf.component';
import { TokenStatus } from '@enum/Token';
import { PanelPopupsService } from 'src/app/pages/user-panel/popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-token-row-item',
  templateUrl: './token-row-item.component.html',
  styleUrl: './token-row-item.component.scss',
  imports: [SharedModule, TokensPdfComponent],
})
export class TokenRowItemComponent {
  @Input() item!: TokenObj;

  @Input() isSelectMultiple: boolean = false;

  @Output() checkboxChange = new EventEmitter<{ row: TokenObj; isChecked: boolean }>();

  @Output() refresh = new EventEmitter();

  isChecked: boolean = false;

  tokenIds: number[] = [];

  selectedRows: TokenObj[] = [];

  isCopyAction: boolean = false;

  @ViewChild(TokensPdfComponent) tokenPdfCom!: TokensPdfComponent;

  badgeClass = computed(() => {
    if (this.item.status === TokenStatus.GENERATED) {
      return 'badge-light';
    }

    if (this.item.status === TokenStatus.PROCESSED) {
      return 'badge-success';
    }

    if (this.item.status === TokenStatus.CANCELED) {
      return 'badge-danger';
    }

    if (this.item.status === TokenStatus.EXPIRED) {
      return 'badge-warning';
    }

    if (this.item.status === TokenStatus.REVIEWING_CANCELATION) {
      return 'badge-info';
    }

    return 'badge-light';
  });

  get SMSCheckboxId() {
    return `SMSCheckboxId-${this.item.tokenId}`;
  }

  get isGenerated() {
    return this.item.status === TokenStatus.GENERATED;
  }

  get isRedeemed() {
    return this.item.status === TokenStatus.REDEEMED;
  }

  constructor(private panelPopup: PanelPopupsService, private matbiaObserverService: MatbiaObserverService) {}

  ngOnInit(): void {
    this.matbiaObserverService._isUnSelectedRows$.subscribe((val) => {
      if (val) {
        this.isChecked = false;
        this.checkboxChange.emit({ row: this.item, isChecked: this.isChecked });
      }
    });
  }

  isJustNowDate(generatedDateTime: string): boolean {
    const generatedDate = new Date(generatedDateTime);
    // Get the current date and time in UTC
    const currentDateTimeUTC = new Date();
    // Get the current date and time in EST (UTC - 5 hours)
    const currentDateTimeEST = new Date(currentDateTimeUTC.getTime() - 5 * 60 * 60 * 1000);
    // Calculate the time difference in milliseconds between generated date and current date in EST
    const timeDifferenceInMilliseconds = currentDateTimeEST.getTime() - generatedDate.getTime();
    // Convert the time difference to hours
    const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);
    // Return true if the difference is less than 1 hour
    return timeDifferenceInHours <= 1;
  }

  //copy functionality code started
  @HostBinding('class.apikey-hash-wrap') get valid() {
    return true;
  }

  onClicked(event: any) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isCopyAction) {
      return;
    }

    this.isCopyAction = true;
    setTimeout(() => {
      this.isCopyAction = false;
    }, 2000);
  }

  displayValue(tokenNum: string) {
    if (tokenNum) {
      return tokenNum;
    }
    return '';
  }
  //copy functionality code ended

  sendSms() {
    const modalRef = this.panelPopup.openShareTokenSMSPopup();

    modalRef.componentInstance.tokenAmt = this.item.amount;
    modalRef.componentInstance.tokenNum = this.item.tokenNum;
    modalRef.componentInstance.tokenId = this.item.tokenId;

    modalRef.componentInstance.refresh.subscribe((val: boolean) => {
      if (val) {
        this.refresh.emit(val);
      }
    });
  }

  sendEmail() {
    const modalRef = this.panelPopup.openShareTokenEmailPopup();

    modalRef.componentInstance.tokenAmt = this.item.amount;
    modalRef.componentInstance.tokenNum = this.item.tokenNum;
    modalRef.componentInstance.tokenId = this.item.tokenId;

    modalRef.componentInstance.refresh.subscribe((val: boolean) => {
      if (val) {
        this.refresh.emit(val);
      }
    });
  }

  onCheckboxClick() {
    this.isChecked = !this.isChecked;
    this.checkboxChange.emit({ row: this.item, isChecked: this.isChecked });
  }

  cancelModal() {
    const modalRef = this.panelPopup.openCancelTokenPopup();

    modalRef.componentInstance.tokenIds = [this.item.tokenId];
    modalRef.componentInstance.totalAmount = this.item.amount;
    modalRef.componentInstance.refresh.subscribe((val: boolean) => {
      this.refresh.emit(val);
    });
  }

  print() {
    this.tokenPdfCom.print();
  }
}
