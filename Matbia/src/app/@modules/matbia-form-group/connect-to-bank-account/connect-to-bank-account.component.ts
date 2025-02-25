import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ButtonLoaderComponent } from '@matbia/matbia-loader-button/button-loader/button-loader.component';

interface ConnectEvent {
  isWithPlaid: boolean;
}

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-connect-to-bank-account',
  templateUrl: './connect-to-bank-account.component.html',
  styleUrls: ['./connect-to-bank-account.component.scss'],
  imports: [SharedModule, ButtonLoaderComponent],
})
export class ConnectToBankAccountComponent implements OnInit {
  isConnectWithCredentials = false;
  isConnectWithRouting = false;
  @Input() loading = false;

  @Input() isBlockPlaid = false;

  @Output() connectClick = new EventEmitter<ConnectEvent>();
  constructor() {}

  ngOnInit(): void {}

  connectUsingCredentials() {
    this.isConnectWithCredentials = true;
    this.isConnectWithRouting = false;
    this.commonConnectButton(true);
  }

  connectUsingRouting() {
    this.isConnectWithCredentials = false;
    this.isConnectWithRouting = true;
    this.commonConnectButton(false);
  }

  private commonConnectButton(value: boolean) {
    this.connectClick.emit({ isWithPlaid: value });
  }
}
