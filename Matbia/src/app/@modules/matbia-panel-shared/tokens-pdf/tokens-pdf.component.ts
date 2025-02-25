import { CommonModule, CurrencyPipe, DatePipe, NgFor, NgForOf, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { PanelPopupsService } from 'src/app/pages/user-panel/popups/panel-popups.service';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-tokens-pdf',
  imports: [SharedModule],
  templateUrl: './tokens-pdf.component.html',
  styleUrl: './tokens-pdf.component.scss',
})
export class TokensPdfComponent implements OnChanges {
  @Input('tokenData') selectedRows: any[] = [];
  @Input('printPDF') printPDF: boolean = false;

  @Output('closePDF') closePDF: EventEmitter<any> = new EventEmitter();
  protected tokensArrayForPDF: any[] = [];

  pdfSrc: string | ArrayBuffer | undefined;

  @ViewChild('tokensPDF') protected tokensPDF!: ElementRef<HTMLDivElement>;

  constructor(private panelPopup: PanelPopupsService) {}

  ngOnChanges(): void {}

  protected getCustomStyle(index: number): string {
    if (index % 9 === 6) {
      return 'border-bottom-color: transparent;'; // Style for seventh child
    } else if (index % 9 === 7) {
      return 'border-bottom-color: transparent;'; // Style for eighth child
    } else if (index % 9 === 8) {
      return 'border-bottom-color: transparent;'; // Style for ninth child
    } else {
      return ''; // No style for other children
    }
  }

  formatToken(tokenNumber: string): string {
    let tokenHalfLength = Math.ceil(tokenNumber.length / 2);
    return `${tokenNumber.substring(0, tokenHalfLength)}-${tokenNumber.substring(tokenHalfLength, tokenNumber.length)}`;
  }

  print() {
    let n = Math.ceil(this.selectedRows.length / 9) * 9;
    this.tokensArrayForPDF = [...this.selectedRows];
    this.tokensArrayForPDF = this.tokensArrayForPDF.map((token) => {
      let tokenNumber = token.tokenNum || token.tokenNumber;
      return { ...token, formattedToken: this.formatToken(tokenNumber) };
    });
    for (let i = 0; i < n - this.selectedRows.length; i++) {
      this.tokensArrayForPDF.push(null);
    }

    setTimeout(() => {
      this.tokensArrayForPDF.forEach((item) => {
        if (item) this.generateBarcode('#token-' + item.tokenId, +item.tokenNum, item.amount);
      });

      this.tokensPDF.nativeElement;

      const pdf = new jsPDF('p', 'px', 'a4');
      pdf.html(this.tokensPDF.nativeElement, {
        fontFaces: [
          {
            family: 'SFProDisplay-Regular',
            style: 'normal',
            src: [
              {
                url: '/assets/dist/fonts/SFProDisplay-Regular.ttf',
                format: 'truetype',
              },
            ],
          },
          {
            family: 'SFProDisplay-Medium',
            style: 'normal',
            src: [
              {
                url: '/assets/dist/fonts/SFProDisplay-Medium.ttf',
                format: 'truetype',
              },
            ],
          },
        ],
        callback: () => {
          let pdfBlob = pdf.output('blob');
          this.pdfSrc = URL.createObjectURL(pdfBlob);
          this.openTokensPDF();
        },
      });
    }, 0);
  }

  private generateBarcode(id: string, tokenNum: number, amt: number) {
    JsBarcode(id, `${tokenNum}-${amt}`, { format: 'code39', displayValue: false });
  }

  private openTokensPDF() {
    const modalRef = this.panelPopup.openPDFViewPopup();

    modalRef.componentInstance.title = 'Tokens List';

    modalRef.componentInstance.pdfUrl = this.pdfSrc;

    modalRef.dismissed.subscribe(() => {
      this.closePDF.emit('closed');
    });
  }
}
