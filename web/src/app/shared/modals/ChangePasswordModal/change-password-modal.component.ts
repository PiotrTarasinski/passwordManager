import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserActionTypes, ChangePassword } from 'src/app/store/user/user.actions';
import { takeUntil } from 'rxjs/operators';
import { HashAlgorithmEnum } from 'src/app/models/enums/hashAlgorithm.enum';
import { selectUser } from 'src/app/store/selectors/selectUser.selector';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { FormatDateTimePipe } from '../../pipes/format-date-time.pipe';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  hashAlgorithmEnum = HashAlgorithmEnum;
  user: IUserState;
  form: FormGroup;
  hidePassword = true;

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    private dateTimePipe: FormatDateTimePipe,
    public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
  ) {
    this.store.pipe(select(selectUser)).subscribe((user) => {
      this.user = user;
      this.initializeForm();
    });

    this.actions$
      .pipe(ofType(UserActionTypes.ChangePasswordSuccess),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      lastFailureLogin: { value: this.dateTimePipe.transform(this.user?.lastFailureLogin) || '', disabled: true },
      lastSuccessLogin: { value: this.dateTimePipe.transform(this.user?.lastSuccessLogin) || '', disabled: true },
      email: [this.user.email || '', Validators.compose([Validators.required, Validators.email])],
      type: [HashAlgorithmEnum.SHA512, Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, type, password } = this.form.value;

    this.store.dispatch(new ChangePassword({ user: { email, type, password } }));
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
