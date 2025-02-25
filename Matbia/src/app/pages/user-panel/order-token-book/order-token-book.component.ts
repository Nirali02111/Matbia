import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService, ProductItem } from '@services/API/order.service';
import { ConfirmOrderPopupComponent } from './confirm-order-popup/confirm-order-popup.component';
import { PageRouteVariable } from '@commons/page-route-variable';
import { LocalStorageDataService } from '@commons/local-storage-data.service';
import { Router } from '@angular/router';
import { ErrorPopupComponent } from './error-popup/error-popup.component';
import { DonorAPIService } from '@services/API/donor-api.service';
import Swal from 'sweetalert2';
import { MatbiaObserverService } from '@commons/matbia-observer.service';
import { Title } from '@angular/platform-browser';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-order-token-book',
  templateUrl: './order-token-book.component.html',
  styleUrls: ['./order-token-book.component.scss'],
  imports: [SharedModule],
})
export class OrderTokenBookComponent implements OnInit, OnDestroy {
  checkOutList: Array<ProductItem> = [];
  totalAmout: number = 0;
  isConfirmCheckOut: boolean = false;
  availableBalance: number = 0;
  isAvailableBalanceEroor: boolean = false;
  donarInfo: string = '';
  donarInfoName = '';
  donarInfoAdress = '';
  isSummerySectionShow: boolean = false;
  isDevEnv = false;
  isQAEnv = false;
  ShippingFeeDetails: any;
  isShippingFeeAdded: boolean = false;

  constructor(
    protected title: Title,
    private modalService: NgbModal,
    private orderService: OrderService,
    private pageRoute: PageRouteVariable,
    private localStorageDataService: LocalStorageDataService,
    private router: Router,
    private donorAPIService: DonorAPIService,
    private matbiaObserver: MatbiaObserverService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Matbia - Order token book');
    this.matbiaObserver.devMode$.subscribe((val) => {
      this.isDevEnv = val;
    });
    this.matbiaObserver.qaMode$.subscribe((val) => {
      this.isQAEnv = val;
    });
    /* if (!(this.isDevEnv || this.isQAEnv)) {
      Swal.fire({
        html: `<div class="purim-popup"><img src="assets/dist/img/icon-warning.png" al="" /> <h2 class="orders-purim-popup">We are currently not taking any more orders for purim.</h2></div>`,

        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: false,
        showCloseButton: false,
        confirmButtonText: 'OK',
        customClass: {
          container: 'matbia-swal-donation-block-container',
          popup: 'voucher-popup',
          confirmButton: 'purim-popup-confirm-btn',
        },
      }).then(() => {
        this.router.navigate(this.pageRoute.getDashboardRouterLink());
      });
    } */

    let isRedirectFromVoucher = this.localStorageDataService.getIsRedirectFromVoucherPage();
    if (isRedirectFromVoucher == 'false') {
      this.getBackRedirect();
      localStorage.removeItem('isRedirectFromVoucherPage');
    }
    if (isRedirectFromVoucher != 'false') {
      this.getProducts();
    }

    this.getDonar();
    this.getBalance();
  }

  ngOnDestroy(): void {}

  getAddFundsRouterLink() {
    return this.pageRoute.getAddFundsRouterLink();
  }

  confirmOrderPopup() {
    const modalRef = this.modalService.open(ConfirmOrderPopupComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'donate-popup',
      size: 'lg',
      scrollable: true,
    });
    modalRef.componentInstance.totalAmout = this.totalAmout;
    modalRef.componentInstance.donarInfo = this.donarInfo;
    localStorage.setItem('checkOutListArray', JSON.stringify(this.checkOutList));
    modalRef.componentInstance.emtOnConfirm.subscribe((val: boolean) => {
      if (val) {
        this.checkOut();
      }
    });
  }

  getProducts() {
    this.orderService.getProducts().subscribe(
      (res) => {
        if (res) {
          this.checkOutList = res.filter((item) => item.title != 'Shipping Fee');
          this.ShippingFeeDetails = res.filter((item) => item.title == 'Shipping Fee');
        }
        res.forEach((item) => {
          if (item.title == 'Blank Tokens') {
            if (!this.localStorageDataService.getGenerateTokenInfo()) {
              this.checkOutList = this.checkOutList.filter((x) => x.title !== 'Blank Tokens');
            }
          }
        });
        this.checkOutList.map((x) => {
          x.productCount = 0;
          x.voucherCount = 0;
          x.selectedVoucherAmount = 0;
        });
      },
      () => {}
    );
  }

  removeMix(title: string) {
    if (title.includes('Mix')) {
      this.checkOutList.map((o) => {
        if (title == o.title) {
          title = o.title.replace('Mix - ', ' ');
        }
      });
      return title;
    } else if (title.includes('Blank Tokens')) {
      return 'Blank';
    } else {
      return title;
    }
  }

  IncreaseProduct(productId: number) {
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.productId == productId) {
        o.productCount += 1;
        o.voucherCount = o.productCount * 50;
        if (o.description.includes('25')) {
          o.voucherCount = o.productCount * 25;
        }
        o.selectedVoucherAmount = o.price * o.productCount;
        this.totalAmoutSummery();
        return o;
      }
      return o;
    });
    this.checkAvailableBalance();
  }

  DecreaseProduct(productId: number) {
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.productId == productId && o.productCount > 0) {
        o.productCount -= 1;
        o.voucherCount = o.productCount * 50;
        o.selectedVoucherAmount = o.price * o.productCount;
        this.totalAmoutSummery();
        return o;
      }
      return o;
    });
    this.checkAvailableBalance();
  }

  totalAmoutSummery() {
    this.totalAmout = 0;
    this.checkOutList.map((x) => {
      this.totalAmout += x.selectedVoucherAmount;
    });
    if (this.ShippingFeeDetails?.length > 0) {
      this.isShippingFeeAdded = true;
      this.totalAmout += this.ShippingFeeDetails[0].price;
    }
    return this.totalAmout;
  }

  checkOut() {
    let products = [{ productId: 0, qty: 0, amount: 0 }];
    products = [];

    this.checkOutList.map((x) => {
      if (x.productCount > 0) {
        products.push({ productId: x.productId, qty: x.productCount, amount: x.price });
      }
    });

    let obj = {
      totalAmount: this.totalAmout,
      products: products,
    };
    if (this.isShippingFeeAdded) {
      obj.totalAmount = obj.totalAmount - this.ShippingFeeDetails[0].price;
    }
    this.orderService.checkOut(obj).subscribe(
      () => {
        localStorage.removeItem('isRedirectFromVoucherPage');
        this.isConfirmCheckOut = true;
      },
      (err) => {
        const modalRef = this.modalService.open(ErrorPopupComponent, {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'donate-popup',
          size: 'lg',
          scrollable: true,
        });
        modalRef.componentInstance.error = err.error;
      }
    );
  }

  onAddFunds() {
    this.localStorageDataService.setIsRedirectFromVoucherPage('true');
    localStorage.setItem('checkOutListArray', JSON.stringify(this.checkOutList));
  }

  getBackRedirect() {
    let checkOutListArray = localStorage.getItem('checkOutListArray');
    this.checkOutList = JSON.parse(checkOutListArray || '');
    this.totalAmoutSummery();
  }

  checkAvailableBalance() {
    if (this.availableBalance < this.totalAmout) {
      this.isAvailableBalanceEroor = true;
      return;
    }
    this.isAvailableBalanceEroor = false;
  }

  backToOverView() {
    this.router.navigate(this.pageRoute.getDashboardRouterLink());
  }

  getDonar() {
    let userHandle = this.localStorageDataService.getLoginUserUserName();
    this.donorAPIService.get(userHandle).subscribe((res) => {
      if (res) {
        this.donarInfo += res.firstName + ' ';
        this.donarInfo += res.lastName + ' ';
        this.donarInfo += res.address + ' ';
        this.donarInfo += res.apt + ' ';
        this.donarInfo += res.city + ' ';
        this.donarInfo += res.state + ' ';
        this.donarInfo += res.zip + ' ';
        this.donarInfoName = res.firstName + ' ' + res.lastName;
        this.donarInfoAdress = res.address + ' ' + res.apt + ' ' + res.city + ' ' + res.state + ' ' + res.zip + ' ';
      }
    });
  }

  getBalance() {
    this.donorAPIService.getBalance().subscribe((res) => {
      this.availableBalance = res.availableBalanceInclFunding || 0;
    });
  }

  summerySectionShow() {
    if (this.totalAmout > 0 && !(this.isShippingFeeAdded && this.totalAmout == this.ShippingFeeDetails[0].price)) {
      this.isSummerySectionShow = true;
      return this.isSummerySectionShow;
    }

    if (this.checkOutList) {
      const allProductCountZero = this.checkOutList.every(
        (item) => item.productCount == 0 || item.title == 'Blank Tokens'
      );
      const blankToken = this.checkOutList.find((item) => item.productId === 14);
      const showSummary = allProductCountZero && (blankToken?.productCount ?? 0) > 0;
      if (showSummary) {
        return true;
      }
      if (this.isShippingFeeAdded && this.totalAmout == this.ShippingFeeDetails[0].price) {
        this.totalAmout = 0;
        this.isShippingFeeAdded = false;
      }
    }
    this.isSummerySectionShow = false;
    return this.isSummerySectionShow;
  }
}
