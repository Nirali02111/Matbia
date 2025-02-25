import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { LocalStorageDataService } from '@commons/local-storage-data.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: '[app-custom-donate-url]',
  template: `
    <ng-container *ngIf="withLabel">
      <p class="custom-donate-url-tag action-copy" [class.copied]="isCopyAction">
        <b style="min-width: 85px;">CUSTOM DONATE PAGE URL:</b> {{ displayValue() }}
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
    </ng-container>

    <ng-container *ngIf="!withLabel">
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
          ></i
        >
      </div>
    </ng-container>
  `,
  imports: [SharedModule],
})
export class CustomDonateURLComponent implements OnInit {
  isCopyAction = false;

  @Input() withLabel = true;

  @HostBinding('class.app-custom-donate-url-wrap') get valid() {
    return true;
  }

  constructor(private localStorage: LocalStorageDataService) {}

  ngOnInit(): void {}

  displayValue() {
    return `https://matbia.org/d/${this.localStorage.getLoginUserAccountHash()}`;
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
