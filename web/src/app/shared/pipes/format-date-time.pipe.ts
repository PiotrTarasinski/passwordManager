import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDateTime'
})
export class FormatDateTimePipe implements PipeTransform {

  transform(date: string): string {
    if (date && !isNaN(new Date(date).getTime())) {
      return new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '-')
        + ' ' + new Date(date).toLocaleTimeString();
    }
    return '';
  }

}
