import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { DecryptActionLogCredential, GetActionLog, RestoreState, UserActionTypes } from 'src/app/store/user/user.actions';
import { pluck, takeUntil } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IActionLog } from 'src/app/models/interfaces/dashboard.interface';
import Swal from 'sweetalert2';
import { selectUser } from 'src/app/store/selectors/selectUser.selector';

@Component({
  selector: 'app-action-log-modal',
  templateUrl: './action-log-modal.component.html',
  styleUrls: ['./action-log-modal.component.scss']
})
export class ActionLogModalComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  displayedColumns: string[] =
    [
      'passwordId',
      'date',
      'info',
      'url',
      'description',
      'username',
      'password',
      'type',
      'actions',
    ];

  isInitialized = false;
  elementList: IActionLog[] = [];
  dataSource = new MatTableDataSource(this.elementList);
  search = '';
  searchedBy = '';
  visiblePasswords: string[] = [];
  editMode = false;

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    public dialogRef: MatDialogRef<ActionLogModalComponent>,
  ) {
    this.store.pipe(select(selectUser)).subscribe(({ editMode }) => {
      this.editMode = editMode;
    });

    this.actions$
      .pipe(ofType(UserActionTypes.GetActionLogSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe((payload: IActionLog[]) => {
        this.elementList = payload;
        this.dataSource.data = this.elementList;
        this.visiblePasswords = [];
        this.isInitialized = true;
      });

    this.actions$
      .pipe(ofType(UserActionTypes.DecryptActionLogCredentialSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe(({ id, oldPassword, newPassword }: IActionLog) => {
        this.elementList = this.elementList.map(el => el.id === id ? { ...el, oldPassword, newPassword } : el);
        this.dataSource.data = this.elementList;
        this.visiblePasswords.push(id);
      });

    this.actions$
      .pipe(ofType(UserActionTypes.RestoreStateSuccess),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  ngOnInit() {
    this.store.dispatch(new GetActionLog());
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  filterByValue() {
    this.dataSource.filter = this.search.toLocaleLowerCase();
    this.searchedBy = this.search;
  }

  togglePassword({ id }: IActionLog) {
    const index = this.visiblePasswords.indexOf(id);
    index === -1 ? this.store.dispatch(new DecryptActionLogCredential(id)) : this.visiblePasswords.splice(index, 1);
  }

  restore({ id }: IActionLog) {
    Swal.fire({
      title: 'Restore Status',
      text: 'Are you sure you want to restore state?',
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#5a2aa2'
    }).then(({ value }) => {
      if (value) {
        this.store.dispatch(new RestoreState(id));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
