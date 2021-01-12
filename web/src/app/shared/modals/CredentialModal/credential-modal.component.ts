import { Component, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICredential } from 'src/app/models/interfaces/dashboard.interface';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddCredential, DecryptCredential, EditCredential, UserActionTypes } from 'src/app/store/user/user.actions';
import { pluck, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-credential-modal',
  templateUrl: './credential-modal.component.html',
  styleUrls: ['./credential-modal.component.scss']
})
export class CredentialModalComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  form: FormGroup;
  hidePassword = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ICredential | null,
    private store: Store<IState>,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CredentialModalComponent>,
  ) {
    this.initializeForm();

    this.actions$
      .pipe(ofType(
        UserActionTypes.AddCredentialSuccess,
        UserActionTypes.EditCredentialSuccess,
      ),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.dialogRef.close();
      });

      this.actions$
      .pipe(ofType(UserActionTypes.DecryptCredentialSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe(({ password }: ICredential) => {
          this.form.controls.password.setValue(password);
      });
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      url: [this.data?.url || '', Validators.required],
      username: [this.data?.username || '', Validators.required],
      password: [this.data?.password || '', Validators.required],
      description: [this.data?.description || ''],
    });

    if (this.data) {
      this.store.dispatch(new DecryptCredential(this.data?.id));
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.data ? 
      this.store.dispatch(new EditCredential({ id: this.data?.id, ...this.form.value }))
      : this.store.dispatch(new AddCredential(this.form.value));
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
