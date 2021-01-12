import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { Actions, ofType } from '@ngrx/effects';
import { GetActionLog, UserActionTypes } from 'src/app/store/user/user.actions';
import { pluck, takeUntil } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

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
      'created',
      'updated',
      'url',
      'description',
      'username',
      'password',
      'actions',
    ];

  isInitialized = true;
  elementList: any[] = [];
  dataSource = new MatTableDataSource(this.elementList);
  search = '';
  searchedBy = '';
  visiblePasswords: string[] = [];

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    public dialogRef: MatDialogRef<ActionLogModalComponent>,
  ) {
    this.actions$
      .pipe(ofType(UserActionTypes.GetActionLogSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe((payload: any[]) => {
        this.elementList = payload;
        this.dataSource.data = this.elementList;
      });

    this.actions$
      .pipe(ofType(UserActionTypes.DecryptCredentialSuccess),
        takeUntil(this.destroy$),
        pluck('payload')
      )
      .subscribe(({ id, password }: any) => {
        this.elementList = this.elementList.map(el => el.id === id ? { ...el, password } : el);
        this.dataSource.data = this.elementList;
        this.visiblePasswords.push(id);
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

  togglePassword({ id }: any) {
    // const index = this.visiblePasswords.indexOf(id);
    // index === -1 ? this.store.dispatch(new DecryptCredential(id)) : this.visiblePasswords.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
