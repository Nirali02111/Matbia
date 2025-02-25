import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class DataExportService {
  private _currencyColumn: Array<string> = [];
  private _currencyCellAddress: Array<number> = [];

  /**
   * https://snoopyjc.org/ssf/
   * for more format
   */
  private _currencyFormat = '$#,##0.00';

  private _filename = 'List';

  set fileName(value: string) {
    this._filename = value;
  }

  get fileName() {
    return this._filename;
  }

  set currencyColumn(columns: Array<string>) {
    this._currencyColumn = columns;
  }

  constructor() {}

  private addSignature(): string {
    let filename = `${this.fileName}_${moment(new Date()).format('YYYY-MM-DDTHH:mm')}.xlsx`;
    filename = filename.trim();
    filename = filename.replace(/ /g, '_');
    return filename;
  }

  private findCurrencyCells(range: XLSX.Range, worksheet: XLSX.WorkSheet) {
    this._currencyCellAddress = [];
    for (let R = range.s.r; R < 1; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (!worksheet[cellRef]) continue;
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < this._currencyColumn.length; index++) {
          const element = this._currencyColumn[index];
          if (worksheet[cellRef].v && worksheet[cellRef].v.includes(element)) {
            this._currencyCellAddress.push(C);
            const column = cellRef.charAt(0);
            this.setColumnWidth(worksheet, column, 15);
            continue;
          }
        }
      }
    }
  }

  private cellFormat(worksheet: XLSX.WorkSheet) {
    if (!worksheet['!ref']) {
      return worksheet;
    }

    const range = XLSX.utils.decode_range(worksheet['!ref']);

    this.findCurrencyCells(range, worksheet);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      if (R === 0) continue;
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < this._currencyCellAddress.length; index++) {
        const C = this._currencyCellAddress[index];
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (worksheet[cellRef]) {
          worksheet[cellRef].t = 'n';
          worksheet[cellRef].z = this._currencyFormat;
        }
      }
    }

    return worksheet;
  }

  exportData(data: Array<any>) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, { cellStyles: true });

    const formatWorksheet = this.cellFormat(worksheet);

    const workbook: XLSX.WorkBook = {
      Sheets: { data: formatWorksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const excelData: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const filename = this.addSignature();
    saveAs(excelData, filename);
  }

  setColumnWidth(ws: any, column: string, width: number) {
    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'][this.getColumnIndex(column)] = { wch: width };
  }

  getColumnIndex(column: string) {
    return XLSX.utils.decode_col(column);
  }
}
