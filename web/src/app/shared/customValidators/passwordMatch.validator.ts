import { ValidatorFn, FormGroup } from '@angular/forms';

export function passwordMatch(password: string, passwordConfirm: string): ValidatorFn {
  return (group: FormGroup) => {
    const passwordControl = group.get(password);
    const passwordConfirmControl = group.get(passwordConfirm);
    const canPasswordMatchCheck = passwordControl.value && passwordConfirmControl.value;

    if (canPasswordMatchCheck && (passwordControl.value !== passwordConfirmControl.value)) {
      passwordConfirmControl.setErrors({ passwordNotMatch: true });
      passwordControl.setErrors({ passwordNotMatch: true });
      passwordConfirmControl.markAsTouched();
      passwordControl.markAsTouched();
    } else {
      !passwordConfirmControl.value ? passwordConfirmControl.setErrors({ required: true }) : passwordConfirmControl.setErrors(null);
      !passwordControl.value ? passwordControl.setErrors({ required: true }) : passwordControl.setErrors(null);
    }

    return passwordControl.value !== passwordConfirmControl.value ? { passwordNotMatch: passwordControl.value } : null;
  };
}
