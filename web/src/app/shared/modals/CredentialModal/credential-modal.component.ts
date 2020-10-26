import { Component, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICredential } from 'src/app/models/interfaces/dashboard.interface';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions } from '@ngrx/effects';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  }

  initializeForm() {
    this.form = this.formBuilder.group({
      url: [this.data?.url || '', Validators.required],
      username: [this.data?.username || '', Validators.required],
      password: [this.data?.password || '', Validators.required],
      description: [this.data?.description || ''],
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
