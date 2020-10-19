import { Pipe, PipeTransform } from '@angular/core';
import i18next from 'i18next';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'inputError',
  pure: false
})
export class InputErrorPipe implements PipeTransform {

  transform(field: AbstractControl, fieldName?: string): string {
    if (field.invalid) {
      let errorMsg = '';
      if (fieldName) {
        errorMsg = i18next.t(`formErrors.${fieldName}.${Object.keys(field.errors)[0]}`);
      }
      if (!fieldName || errorMsg.startsWith('formErrors')) {
        errorMsg = i18next.t(`formErrors.general.${Object.keys(field.errors)[0]}`);
      }
      return errorMsg.startsWith('formErrors') ? '' : errorMsg;
    }
  }
}
