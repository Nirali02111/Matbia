import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RequestCardPopupComponent } from '@matbia/matbia-shared-popup/request-card-popup/request-card-popup.component';
import { Params } from '@enum/Params';
import { shakeTrigger } from '@commons/animations';
import { CustomValidator } from '@commons/custom-validator';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { AuthService } from '@services/API/auth.service';
import { UserApiService } from '@services/API/user-api.service';

import { ActivateCardPopupComponent } from '../activate-card-popup/activate-card-popup.component';

declare const window: Window &
  typeof globalThis & {
    RequestAnimationFrame?: any;
    CancelAnimationFrame?: any;
    CancelRequestAnimationFrame?: any;

    mozRequestAnimationFrame?: any;
    webkitRequestAnimationFrame?: any;
    msRequestAnimationFrame?: any;
    oRequestAnimationFrame?: any;

    mozCancelAnimationFrame?: any;
    webkitCancelAnimationFrame?: any;
    msCancelAnimationFrame?: any;
    oCancelAnimationFrame?: any;
    mozCancelRequestAnimationFrame?: any;
    webkitCancelRequestAnimationFrame?: any;
    msCancelRequestAnimationFrame?: any;
    oCancelRequestAnimationFrame?: any;
  };

function scroll(element: any) {
  let start: any = null;
  const target = element && element ? element.getBoundingClientRect().top : 0;
  const firstPos = window.pageYOffset || document.documentElement.scrollTop;
  let pos = 0;

  const requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame;

  const cancelAnimationFrame =
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame;

  function showAnimation(timestamp: any) {
    if (!start) {
      start = timestamp || new Date().getTime();
    }

    const elapsed = timestamp - start;
    const progress = elapsed / 800; // animation duration 600ms

    const outQuad = (n: any) => {
      return n * (2 - n);
    };

    const easeInPercentage = +outQuad(progress).toFixed(2);

    pos = target === 0 ? firstPos - firstPos * easeInPercentage : firstPos + target * easeInPercentage;

    window.scrollTo(0, pos);

    if ((target !== 0 && pos >= firstPos + target) || (target === 0 && pos <= 0)) {
      cancelAnimationFrame(start);
      if (element) {
        element.focus();
      }
      pos = 0;
    } else {
      requestAnimationFrame(showAnimation);
    }
  }

  requestAnimationFrame(showAnimation);
}

import { SharedModule } from '@matbia/shared/shared.module';
import { WelcomePageComponent } from '../welcome-page/welcome-page.component';
import { InputErrorComponent } from '@matbia/matbia-input/input-error/input-error.component';
import { PhoneInputComponent } from '@matbia/matbia-input/phone-input/phone-input.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [SharedModule, WelcomePageComponent, InputErrorComponent, PhoneInputComponent],
  animations: [shakeTrigger],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainBanner') mainBanner!: ElementRef;
  @ViewChild('betterWay') betterWay!: ElementRef;
  @ViewChild('contact') contact!: ElementRef;
  pageTitle = 'Matbia';
  metaInformation: MetaDefinition = {
    name: 'description',
    content: 'Matbia',
  };

  modalOptions?: NgbModalOptions;

  public contactUs!: UntypedFormGroup;
  isSubmited = false;
  isLoading = false;
  inAnimation = false;
  alertMessage = '';
  alertType = 'danger';
  isShulKiosk = false;

  private _subscriptions: Subscription = new Subscription();
  @ViewChild('cFirstName') inputFocus: any;

  get Name() {
    return this.contactUs.get('name');
  }

  get Email() {
    return this.contactUs.get('email');
  }

  get Phone() {
    return this.contactUs.get('phone');
  }

  get ContactMessage() {
    return this.contactUs.get('message');
  }

  constructor(
    private metaTags: Meta,
    protected title: Title,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private matbiaObserver: MatbiaObserverService,
    private userApiService: UserApiService
  ) {}

  ngOnInit(): void {
    this.metaTags.updateTag(this.metaInformation);
    this.title.setTitle(this.pageTitle);
    this.contactUs = this.fb.group({
      name: this.fb.control(
        null,
        Validators.compose([Validators.required, CustomValidator.requiredNoWhiteSpace('Name should not be empty')])
      ),
      email: this.fb.control(null, Validators.compose([Validators.required, CustomValidator.email()])),
      phone: this.fb.control(
        null,
        Validators.compose([Validators.required, CustomValidator.requiredNoWhiteSpace('Phone should not be empty')])
      ),
      message: this.fb.control(
        null,
        Validators.compose([Validators.required, CustomValidator.requiredNoWhiteSpace('Message should not be empty')])
      ),
    });

    this.route.queryParamMap.subscribe((params) => {
      if (params.get(Params.CARD_REQUEST)) {
        this.openRequestCard();
      }
    });

    this.route.queryParamMap.subscribe((params) => {
      if (params.get(Params.ACTIVATE_CARD)) {
        this.openActivateCard();
      }
    });

    this.matbiaObserver.shulKiousk$.subscribe((val) => {
      this.isShulKiosk = val;
    });
  }

  ngAfterViewInit(): void {
    this._subscriptions = this.route.fragment.pipe(first()).subscribe((fragment) => {
      if (fragment === 'main-banner') {
        scroll(this.mainBanner.nativeElement);
      }

      if (fragment === 'better-way') {
        scroll(this.betterWay.nativeElement);
      }

      if (fragment === 'contact') {
        scroll(this.contact.nativeElement);
      }
    });

    this.userApiService.contactRedirect.subscribe(() => {
      setTimeout(() => {
        this.inputFocus.nativeElement.focus();
      }, 100);
    });

    this.route.fragment.subscribe((v) => {
      if (v?.includes('contact')) {
        setTimeout(() => {
          this.inputFocus.nativeElement.focus();
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  onActivateCard(event: any) {
    event.preventDefault();
    this.openActivateCard();
  }

  onRequestCard(event: any) {
    event.preventDefault();
    this.openRequestCard();
  }

  openActivateCard() {
    this.modalOptions = {
      centered: true,
      keyboard: false,
      windowClass: 'active-card-pop',
    };
    this.modalService.open(ActivateCardPopupComponent, this.modalOptions);
  }

  openRequestCard() {
    this.modalOptions = {
      centered: true,
      keyboard: false,
    };
    this.modalService.open(RequestCardPopupComponent, this.modalOptions);
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

  onContactUs() {
    this.isSubmited = true;
    if (this.contactUs.invalid) {
      this.contactUs.markAllAsTouched();
      this.triggerAnimation();
      return;
    }

    const values = this.contactUs.value;
    this.isLoading = true;
    this.authService.contactUsMail(values).subscribe(
      (res) => {
        this.isLoading = false;
        this.alertMessage = res;
        this.alertType = 'success';

        this.isSubmited = false;
        this.contactUs.reset();
      },
      (err) => {
        this.isLoading = false;
        this.alertMessage = err.error;
        this.alertType = 'danger';
      }
    );
  }
}
