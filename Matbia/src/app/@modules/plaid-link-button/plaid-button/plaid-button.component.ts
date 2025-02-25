import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { LinkAccountResponse } from 'src/app/models/plaid-model';
import { LinkTokenPayload, PlaidApiService } from '@services/API/plaid-api.service';
import {
  NgxPlaidLinkService,
  PlaidConfig,
  PlaidErrorMetadata,
  PlaidErrorObject,
  PlaidLinkHandler,
  PlaidSuccessMetadata,
} from '@services/ngx-plaid-link.service';
import { environment } from './../../../../environments/environment';
import Swal from 'sweetalert2';
import { DonorAPIService } from '@services/API/donor-api.service';
import { LinkViaRoutingPopupComponent } from '@matbia/matbia-shared-popup/link-via-routing-popup/link-via-routing-popup.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsService } from '@services/analytics.service';
import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-plaid-button',
  template: ` <button class="btn btn-primary plaid-link-btn" [ngClass]="classList" (click)="btnClickAction($event)">
    {{ title }}
  </button>`,
  styleUrls: ['./plaid-button.component.scss'],
  imports: [SharedModule],
  providers: [NgxPlaidLinkService],
})
export class PlaidButtonComponent implements OnInit {
  isLoading = false;
  // tslint:disable-next-line: no-input-rename
  @Input('title') title = 'Connect via Plaid Link';

  // tslint:disable-next-line: no-input-rename
  @Input('classList') classList = '';

  @Input() userHandle = '';

  // for manually linked accounts
  @Input() accessToken = '';

  @Input() requestKYCFirst = false;
  @Output() linked = new EventEmitter();

  @Output() exited = new EventEmitter();

  private plaidLinkHandler!: PlaidLinkHandler;

  kycSubscription!: Subscription;
  linkSubscription!: Subscription;
  isLinkedAccountClicked: boolean = false;

  constructor(
    private plaidLinkService: NgxPlaidLinkService,
    private plaidAPI: PlaidApiService,
    private matbiaDonorAPI: DonorAPIService,
    private modalService: NgbModal,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {}

  open() {
    this.plaidLinkHandler.open();
  }

  exit() {
    this.plaidLinkHandler.exit();
  }

  onSuccess(token: any, metadata: PlaidSuccessMetadata) {
    if (!this.isLinkedAccountClicked) {
      this.linkAccounts(token, metadata);
    }
  }

  onExit(_error: PlaidErrorObject, _metadata: PlaidErrorMetadata) {
    this.exited.emit();
  }

  btnClickAction(event: Event) {
    event.preventDefault();
    this.openLinkAccount();
  }

  openLinkAccount() {
    if (!this.userHandle) {
      Swal.fire({
        text: 'User Handle not found',
        icon: 'error',
      });
      return;
    }

    if (this.isLoading) {
      return;
    }

    if (this.requestKYCFirst) {
      this.requestKYC();
      return;
    }

    this.getToken();
  }

  initPlaid(linkToken: string) {
    const config: PlaidConfig = {
      env: environment.PLAID_ENV,
      onSuccess: (token: any, metadata: PlaidSuccessMetadata) => this.onSuccess(token, metadata),
      onExit: (error: any, metadata: PlaidErrorMetadata) => this.onExit(error, metadata),
      product: [],
      token: linkToken,
    };

    this.plaidLinkService.createPlaid(config).then((handler: PlaidLinkHandler) => {
      this.plaidLinkHandler = handler;
      this.open();
    });
  }

  private getLoadingPopup() {
    return Swal.fire({
      text: 'Preparing secure link...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'CONTINUE',
      customClass: {
        loader: 'plaid-linking-loader',
        container: 'plaid-linking-container',
        popup: 'plaid-linking-popup',
      },
      loaderHtml: '<div class="spinner-border text-primary"></div>',
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  requestKYC() {
    this.isLoading = true;

    const loader = this.getLoadingPopup();
    loader.then((result) => {
      if (result.isDismissed) {
        this.isLoading = false;
        this.kycSubscription.unsubscribe();

        if (this.linkSubscription) {
          this.linkSubscription.unsubscribe();
        }
        this.exited.emit();
      }
    });

    this.kycSubscription = this.matbiaDonorAPI.requestKYC(this.userHandle).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.errors && response.errors.length !== 0) {
          this.displayErrorPopup(response.errors[0].error);
          return;
        }

        if (!response.success) {
          this.displayErrorPopup(response.data.message);
          return;
        }

        if (response.success) {
          this.getToken();
          return;
        }

        this.displayErrorPopup('Something want wrong');
      },
      (err) => {
        this.isLoading = false;

        this.displayErrorPopup(err.error);
      }
    );
  }

  private getToken() {
    this.isLoading = true;

    if (!this.requestKYCFirst) {
      const loader = this.getLoadingPopup();
      loader.then((result) => {
        if (result.isDismissed) {
          this.isLoading = false;
          this.linkSubscription.unsubscribe();
          this.exited.emit();
        }
      });
    }

    const data: LinkTokenPayload = {
      userHandle: this.userHandle,
    };

    if (this.accessToken) {
      data.accessToken = this.accessToken;
    }

    this.linkSubscription = this.plaidAPI.getLinkToken(data).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.errors && response.errors.length !== 0) {
          Swal.fire({
            text: response.errors[0].error,
            icon: 'error',
          });
          this.exited.emit();
          return;
        }

        if (response.success) {
          Swal.close();
          this.isLoading = false;
          this.isLinkedAccountClicked = false;
          this.initPlaid(response.linkToken);
        }
      },
      (_error) => {
        this.isLoading = false;
        Swal.fire({
          text: 'Error in Generating secure link',
          icon: 'error',
        });

        this.exited.emit();
      }
    );
  }

  private linkAccounts(token: any, metadata: PlaidSuccessMetadata) {
    if (metadata.accounts && metadata.accounts.length !== 0) {
      const linkListAPI = metadata.accounts.map((o) => {
        const data = {
          userHandle: this.userHandle,
          publicToken: token,
          accountName: o.name,
          accountId: o.id,
          accountType: o.subtype,
          accountNumber: o.mask,
          plaidTokenType: 'link',
          isManualAccountLink:
            o.verification_status && o.verification_status === 'pending_manual_verification' ? true : false,
        };

        this.isLinkedAccountClicked = true;
        return this.plaidAPI.linkAccount(data);
      });

      this.isLoading = true;

      Swal.fire({
        text: 'Adding Account...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'CONTINUE',
        customClass: {
          loader: 'plaid-linking-loader',
          container: 'plaid-linking-container',
          popup: 'plaid-linking-popup',
        },
        loaderHtml: '<div class="spinner-border text-primary"></div>',
        didOpen: () => {
          Swal.showLoading();
        },
      }).then((res) => {
        if (res.isConfirmed) {
          this.linked.emit({
            token,
            metadata,
          });
        }
      });

      forkJoin(linkListAPI).subscribe(
        (response: Array<LinkAccountResponse>) => {
          this.isLoading = false;

          const errorsResponse = response.filter((o) => o.errors && o.errors.length !== 0);
          if (errorsResponse.length !== 0) {
            Swal.close();
            let modalOptions: NgbModalOptions = {
              centered: true,
              keyboard: false,
              backdrop: 'static',
              windowClass: 'link-via-Routing-popup',
            };
            const modal = this.modalService.open(LinkViaRoutingPopupComponent, modalOptions);
            modal.componentInstance.isError = true;
            modal.closed.subscribe((res) => {
              if (res) this.openLinkAccount();
            });
            return;
          }

          Swal.hideLoading();

          if (this.checkIsManuallyAccountLink(metadata)) {
            this.displayManuallyAccountLink();
            return;
          }

          if (this.accessToken) {
            Swal.update({
              title: 'Account Verified!',
              icon: 'success',
              showCancelButton: false,
              customClass: {
                icon: 'plaid-account-verified',
                title: 'plaid-verified-title',
                htmlContainer: 'plaid-verified-html',
                loader: 'plaid-linking-loader',
                container: 'plaid-linking-container',
                popup: 'plaid-linking-popup',
              },
              html: 'You can now deposit funds from your account to Matbia. The two deposits made will be withdrawn from your bank account within the next few days.',
            });
            return;
          }

          this.analytics.initBankConnectedEvent();

          Swal.update({
            text: 'Account Added!',
            icon: 'success',
            showCancelButton: false,
          });
        },
        (_error) => {
          this.isLoading = false;
          let validateMessage =
            'We were unable to automatically validate your account, please upload a bank statement or a voided check to ourcustomer service email office@matbia.com so we can manually verify your account info';
          this.displayErrorPopup(validateMessage);
        }
      );
    }
  }

  displayErrorPopup(textMessage: any) {
    Swal.hideLoading();
    Swal.update({
      text: textMessage,
      icon: 'error',
      showConfirmButton: false,
    });

    this.exited.emit();
  }

  checkIsManuallyAccountLink(metadata: PlaidSuccessMetadata) {
    const linkListAPI = metadata.accounts.find((o) => {
      return o.verification_status && o.verification_status === 'pending_manual_verification';
    });

    if (linkListAPI) {
      return true;
    }
    return false;
  }

  private displayManuallyAccountLink() {
    Swal.update({
      title: 'Verification Pending',
      showCancelButton: false,
      confirmButtonText: 'OK',
      icon: 'success',
      customClass: {
        icon: 'plaid-pending',
        title: 'verification-pending-title',
        htmlContainer: 'verification-pending-html',
        loader: 'plaid-linking-loader',
        container: 'plaid-linking-container',
        popup: 'plaid-linking-popup',
      },
      html: `<ol>
                <li>You’ll receive two small deposits in your bank account within the next 24 hours, and get an email alert once they’ve arrived.</li>
                <li>You’ll then see an option to verify the amount of each deposit.</li>
                <li>Once verification is complete, your bank account will be linked to your Matbia account.</li>
            </ol>`,
    });
    return;
  }
}
