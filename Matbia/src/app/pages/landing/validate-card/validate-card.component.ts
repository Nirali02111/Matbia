import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { MatbiaCardAPIService, ValidateCardResponse } from '@services/API/matbia-card-api.service';
import { MATBIA_CARD_STATUS } from '@enum/MatbiaCard';
import { ActivateCardPopupComponent } from '../activate-card-popup/activate-card-popup.component';

import Swal from 'sweetalert2';
import { Params } from '@enum/Params';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-validate-card',
  templateUrl: './validate-card.component.html',
  styleUrls: ['./validate-card.component.scss'],
  imports: [SharedModule],
})
export class ValidateCardComponent implements OnInit {
  isLoading = false;
  cardNumber!: string;

  modalOptions?: NgbModalOptions;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private matbiaCardAPI: MatbiaCardAPIService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.activeRoute.queryParamMap.subscribe((params) => {
      const identity = params.get(Params.SHUL_KIOSK);
      const id = params.get(Params.CARD_NUMBER);
      if (id && identity) {
        this.cardNumber = id;
        this.validateAPI();
      } else {
        this.invalidUrl();
      }
    });
  }

  invalidUrl(title = 'Invalid Url') {
    Swal.fire({
      title,
      icon: 'error',
    });
  }

  displayNextStep(status: string) {
    if (status === MATBIA_CARD_STATUS.ACTIVE) {
      this.router.navigate(['auth', 'card-login', this.cardNumber]);
      return;
    }

    if (status === MATBIA_CARD_STATUS.NOT_ACTIVE) {
      this.openActiveCardPopup();
    }
  }

  validateAPI() {
    this.isLoading = true;
    this.matbiaCardAPI.validateCard(this.cardNumber).subscribe(
      (res: ValidateCardResponse) => {
        this.isLoading = false;
        if (res && res.error) {
          this.invalidUrl(res.error);
        }

        this.displayNextStep(res.status);
      },
      (err) => {
        this.isLoading = false;
        this.invalidUrl(err.error);
      }
    );
  }

  openActiveCardPopup() {
    this.modalOptions = {
      centered: true,
      keyboard: false,
      windowClass: 'active-card-pop',
    };
    this.modalService.open(ActivateCardPopupComponent, this.modalOptions);
  }
}
