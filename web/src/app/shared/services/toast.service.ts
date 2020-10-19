import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ToastService {
  constructor(private toast: ToastrService) { }

  private toastConfig = {
    enableHtml: true,
    positionClass: 'toast-custom',
  };

  toggleSuccessToast(title: string) {
    this.toast.success(title, null, { ...this.toastConfig, timeOut: 3000 });
  }

  toggleErrorToast(title: string) {
    this.toast.error(title, null, { ...this.toastConfig, timeOut: 0 });
  }
}
