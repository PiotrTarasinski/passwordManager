import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HashAlgorithmEnum } from 'src/app/models/enums/hashAlgorithm.enum';
import { passwordMatch } from 'src/app/shared/customValidators/passwordMatch.validator';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { SignUp, UserActionTypes } from 'src/app/store/user/user.actions';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  hashAlgorithmEnum = HashAlgorithmEnum;

  hidePassword = true;
  form: FormGroup;

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.initializeForm();

    this.actions$
      .pipe(ofType(UserActionTypes.SignUpSuccess),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        Swal.fire({
          title: 'Account Created',
          text: 'Now you can login to your account',
          icon: 'success',
          showCloseButton: true,
          confirmButtonText: 'Login',
          confirmButtonColor: '#5a2aa2',
          timer: 3000,
        }).then(() => {
          this.router.navigateByUrl('/login');
        });
      });
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
      type: [HashAlgorithmEnum.SHA512, Validators.compose([
        Validators.required
      ])],
      password: ['', Validators.compose([
        Validators.required
      ])],
      confirmPassword: ['', Validators.compose([
        Validators.required
      ])],
    }, { validators: passwordMatch('password', 'confirmPassword') });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.dispatch(new SignUp({user: {...this.form.value}}));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
