import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { IState } from 'src/app/models/interfaces/store';
import { selectUser } from 'src/app/store/selectors/selectUser.selector';
import { IUserState } from 'src/app/models/interfaces/store/user-state.interface';
import { Logout } from 'src/app/store/user/user.actions';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordModalComponent } from '../../modals/ChangePasswordModal/change-password-modal.component';
import { ActionLogModalComponent } from '../../modals/ActionLogModal/action-log-modal.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnDestroy {
  private destroy$ = new Subject<boolean>();

  user: IUserState;

  constructor(
    private store: Store<IState>,
    private dialog: MatDialog,
  ) {
    this.store.pipe(select(selectUser)).subscribe(res => {
      this.user = res;
    });
  }

  openChangePasswordModal() {
    this.dialog.open(ChangePasswordModalComponent, { autoFocus: false });
  }

  openActionLogModal() {
    this.dialog.open(ActionLogModalComponent, { autoFocus: false });
  }

  logout() {
    this.store.dispatch(new Logout());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
