import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ICredential } from 'src/app/models/interfaces/dashboard.interface';
import { IState } from 'src/app/models/interfaces/store';

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
      'url',
      'description',
      'username',
      'password',
      'actions',
    ];

  isInitialized = true;
  elementList: ICredential[] = [];
  dataSource = new MatTableDataSource(this.elementList);
  search = '';

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
  ) { }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  filterByValue() {
    this.dataSource.filter = this.search.toLocaleLowerCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
