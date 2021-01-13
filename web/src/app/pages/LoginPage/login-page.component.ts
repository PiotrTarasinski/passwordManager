import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { SignIn, UnblockAccount } from 'src/app/store/user/user.actions';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  hidePassword = true;
  form: FormGroup;

  constructor(
    private store: Store<IState>,
    private formBuilder: FormBuilder,
  ) {
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
      password: ['', Validators.compose([
        Validators.required
      ])],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.dispatch(new SignIn({ user: { ...this.form.value } }));
  }

  unblockAccount() {
    this.store.dispatch(new UnblockAccount());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
