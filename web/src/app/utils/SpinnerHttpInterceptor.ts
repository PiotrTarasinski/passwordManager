import { finalize, tap } from 'rxjs/operators';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class SpinnerHttpInterceptor implements HttpInterceptor {

  count = 0;

  constructor(private spinner: NgxSpinnerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    setTimeout(() => this.spinner.show(), 0);
    this.count++;

    return next.handle(req)
      .pipe(
        tap(),
        finalize(() => {
          this.count--;

          if (this.count === 0) {
            setTimeout(() => this.spinner.hide(), 0);
          }
        })
      );
  }
}
