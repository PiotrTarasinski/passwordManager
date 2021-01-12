import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserActionTypes, ChangePassword } from 'src/app/store/user/user.actions';
import { takeUntil } from 'rxjs/operators';
import { HashAlgorithmEnum } from 'src/app/models/enums/hashAlgorithm.enum';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss']
})
export class ChangePasswordModalComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  hashAlgorithmEnum = HashAlgorithmEnum;

  form: FormGroup;
  hidePassword = true;

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
  ) {
    this.initializeForm();

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
      oldPassword: ['', Validators.required],
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

    this.store.dispatch(new ChangePassword(this.form.value));
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
