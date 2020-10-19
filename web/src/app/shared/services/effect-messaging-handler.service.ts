import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { ToastService } from './toast.service';
import { IState } from 'src/app/models/interfaces/store';
import i18next from 'i18next';

@Injectable({
  providedIn: 'root',
})
export class EffectMessagingHandlerService {

  constructor(
    private store: Store<IState>,
    private toast: ToastService,
  ) { }

  public handleError(caughtObs: Observable<Action>, action: Action, toastMessage?: string) {
    if (toastMessage) {
      this.toast.toggleErrorToast(toastMessage);
    } else {
      this.toast.toggleErrorToast(i18next.t('common.dataLoadError'));
    }

    this.store.dispatch(action);
    return caughtObs;
  }


  public handleSuccess(action: Action, toastMessage?: string) {
    if (toastMessage) {
      this.toast.toggleSuccessToast(toastMessage);
    }

    return of(action);
  }
}
