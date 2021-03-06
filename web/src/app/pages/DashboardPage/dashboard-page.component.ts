import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ICredential } from 'src/app/models/interfaces/dashboard.interface';
import { IState } from 'src/app/models/interfaces/store';
import { MatDialog } from '@angular/material/dialog';
import { CredentialModalComponent } from 'src/app/shared/modals/CredentialModal/credential-modal.component';
import Swal from 'sweetalert2';
import { GetCredentials, UserActionTypes, RemoveCredential, DecryptCredential } from 'src/app/store/user/user.actions';
import { takeUntil, pluck } from 'rxjs/operators';
import { ShareCredentialModalComponent } from 'src/app/shared/modals/ShareCredentialModal/share-credential-modal.component';
import { selectUser } from 'src/app/store/selectors/selectUser.selector';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<boolean>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  displayedColumns: string[] =
    [
      'created',
      'updated',
      'url',
      'description',
      'username',
      'password',
      'actions',
    ];

  isInitialized = false;
  elementList: ICredential[] = [];
  dataSource = new MatTableDataSource(this.elementList);
  search = '';
  searchedBy = '';
  visiblePasswords: string[] = [];
  editMode = false;

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    private dialog: MatDialog,
  ) {
    this.store.pipe(select(selectUser)).subscribe(({ editMode }) => {
      this.editMode = editMode;
    });

    this.actions$
      .pipe(ofType(UserActionTypes.GetCredentialsSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe((passwords: ICredential[]) => {
        this.elementList = passwords;
        this.dataSource.data = this.elementList;
        this.visiblePasswords = [];
        this.isInitialized = true;
      });

    this.actions$
      .pipe(ofType(UserActionTypes.DecryptCredentialSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe(({ id, password }: ICredential) => {
        this.elementList = this.elementList.map(el => el.id === id ? { ...el, password } : el);
        this.dataSource.data = this.elementList;
        this.visiblePasswords.push(id);
      });

    this.actions$
      .pipe(ofType(
        UserActionTypes.AddCredentialSuccess,
        UserActionTypes.EditCredentialSuccess,
        UserActionTypes.RemoveCredentialSuccess,
        UserActionTypes.RestoreStateSuccess
      ),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.store.dispatch(new GetCredentials());
      });
  }

  ngOnInit() {
    this.store.dispatch(new GetCredentials());
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  filterByValue() {
    this.dataSource.filter = this.search.toLocaleLowerCase();
    this.searchedBy = this.search;
  }

  openCredentialModal(credential?: ICredential) {
    this.dialog.open(CredentialModalComponent, { autoFocus: false, data: credential || null });
  }

  openShareCredentialModal(credential: ICredential) {
    this.dialog.open(ShareCredentialModalComponent, { autoFocus: false, data: credential.id });
  }

  removeCredential({ id }: ICredential) {
    Swal.fire({
      title: 'Remove Credential',
      text: 'Are you sure you want to permamently remove credential?',
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#5a2aa2'
    }).then(({ value }) => {
      if (value) {
        this.store.dispatch(new RemoveCredential(id));
      }
    });
  }

  togglePassword({ id }: ICredential) {
    const index = this.visiblePasswords.indexOf(id);
    index === -1 ? this.store.dispatch(new DecryptCredential(id)) : this.visiblePasswords.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
