import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(date: string | Date): string {
    if (date && !isNaN(new Date(date).getTime())) {
      return new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '-');
    }
    return '';
  }

}
