import { Component, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShareCredential, UserActionTypes } from 'src/app/store/user/user.actions';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-share-credential-modal',
  templateUrl: './share-credential-modal.component.html',
  styleUrls: ['./share-credential-modal.component.scss']
})
export class ShareCredentialModalComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public passwordId: string,
    private store: Store<IState>,
    private actions$: Actions,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ShareCredentialModalComponent>,
  ) {
    this.initializeForm();

    this.actions$
      .pipe(ofType(UserActionTypes.ShareCredentialSuccess),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.value;
    this.store.dispatch(new ShareCredential({ passwordId: this.passwordId, email }));
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
