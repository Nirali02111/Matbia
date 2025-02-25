import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-signup-confirm-popup',
  templateUrl: './signup-confirm-popup.component.html',
  styleUrls: ['./signup-confirm-popup.component.scss'],
  imports: [SharedModule],
})
export class SignupConfirmPopupComponent implements OnInit, OnDestroy {
  isLoading = false;

  isResend = false;

  unsub!: Subscription;

  @Input() modalObs!: Observable<{ isLoading: boolean }>;

  @Input() email!: string;

  @Output() resendEvent = new EventEmitter();

  constructor(private router: Router, public activeModal: NgbActiveModal) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = 'reload';
  }

  ngOnInit(): void {
    this.unsub = this.modalObs.subscribe(({ isLoading }) => {
      if (this.isLoading && !isLoading) {
        this.isResend = true;
      }
      this.isLoading = isLoading;
    });
  }

  ngOnDestroy(): void {
    this.unsub.unsubscribe();
  }

  onClose() {
    this.activeModal.close();
  }

  onResend() {
    this.resendEvent.emit();
  }

  openEmail() {
    window.location.href = 'https://mail.google.com/mail/u/0/#inbox';
  }

  tryAnotherMail(event: Event) {
    event.preventDefault();
    this.activeModal.close();

    this.router.navigate(['signup']);
  }
}
