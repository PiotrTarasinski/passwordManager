import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ICredential } from 'src/app/models/interfaces/dashboard.interface';
import { IState } from 'src/app/models/interfaces/store';
import { MatDialog } from '@angular/material/dialog';
import { CredentialModalComponent } from 'src/app/shared/modals/CredentialModal/credential-modal.component';
import Swal from 'sweetalert2';

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
  searchedBy = '';

  constructor(
    private store: Store<IState>,
    private actions$: Actions,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
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
        // @todo
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
