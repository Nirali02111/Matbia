import { Pipe, PipeTransform } from '@angular/core';
import { HDate } from '@hebcal/core';
import moment from 'moment';

@Pipe({
  name: 'hebrewCalenderDate',
})
export class HebrewCalenderDatePipe implements PipeTransform {
  private generateDate(date: moment.Moment, locale = 'he') {
    return new HDate(date.toDate()).renderGematriya(true);
  }

  transform(value: moment.Moment | null, locale = 'he'): unknown {
    if (!value) {
      return;
    }

    return this.generateDate(value, locale);
  }
}
