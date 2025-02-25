import { Component, HostBinding, OnInit, Input } from '@angular/core';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { AllowCopyDirective } from '@matbia/matbia-directive/block-cut-copy-paste.directive';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: '[app-account-hash]',
  template: `
    @if (withLabel) {
    <p class="account-hash-tag action-copy" [class.copied]="isCopyAction">
      <b>{{ defaultLabel }}:</b> {{ displayValue() }}
      <span class="material-icons" appAllowCopyData [toCopy]="displayValue()" (click)="onClicked($event)"
        ><svg xmlns="http://www.w3.org/2000/svg" width="17.139" height="17.139" viewBox="0 0 17.139 17.139">
          <g id="copy_outline" transform="translate(0.75 0.75)">
            <path
              id="Path_19115"
              data-name="Path 19115"
              d="M18.6,15.557h1.3a1.738,1.738,0,0,0,1.738-1.738V7.738A1.738,1.738,0,0,0,19.9,6H13.819a1.738,1.738,0,0,0-1.738,1.738v1.3M7.738,12.082h6.082a1.738,1.738,0,0,1,1.738,1.738V19.9a1.738,1.738,0,0,1-1.738,1.738H7.738A1.738,1.738,0,0,1,6,19.9V13.819A1.738,1.738,0,0,1,7.738,12.082Z"
              transform="translate(-6 -6)"
              fill="none"
              stroke="#5d62e0"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            />
          </g>
        </svg>
      </span>
    </p>
    } @if (!withLabel) {
    <div class="d-flex align-items-center" [class.copied]="isCopyAction">
      <span>{{ displayValue() }}</span>
      <i appAllowCopyData [toCopy]="displayValue()" (click)="onClicked($event)" class="material-icons copy-link"
        ><svg xmlns="http://www.w3.org/2000/svg" width="17.139" height="17.139" viewBox="0 0 17.139 17.139">
          <g id="copy_outline" transform="translate(0.75 0.75)">
            <path
              id="Path_19115"
              data-name="Path 19115"
              d="M18.6,15.557h1.3a1.738,1.738,0,0,0,1.738-1.738V7.738A1.738,1.738,0,0,0,19.9,6H13.819a1.738,1.738,0,0,0-1.738,1.738v1.3M7.738,12.082h6.082a1.738,1.738,0,0,1,1.738,1.738V19.9a1.738,1.738,0,0,1-1.738,1.738H7.738A1.738,1.738,0,0,1,6,19.9V13.819A1.738,1.738,0,0,1,7.738,12.082Z"
              transform="translate(-6 -6)"
              fill="none"
              stroke="#5d62e0"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            />
          </g>
        </svg>
      </i>
    </div>
    }
  `,
  imports: [AllowCopyDirective, SharedModule],
})
export class AccountHashComponent implements OnInit {
  isCopyAction = false;

  @Input() withLabel = true;

  @Input() defaultLabel = 'Account #';

  @HostBinding('class.app-account-hash-wrap') get valid() {
    return true;
  }

  constructor(private localStorage: LocalStorageDataService) {}

  ngOnInit(): void {}

  displayValue() {
    return this.localStorage.getLoginUserAccountHash();
  }

  onClicked(event: any) {
    event.preventDefault();
    if (this.isCopyAction) {
      return;
    }

    this.isCopyAction = true;
    setTimeout(() => {
      this.isCopyAction = false;
    }, 2000);
  }
}
