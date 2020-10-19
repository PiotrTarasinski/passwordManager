import { HttpParams } from '@angular/common/http';

export function setHttpParams(object: object) {
  let httpParams = new HttpParams();
  if (!object) { return; }
  Object.keys(object).forEach(key => {
    if (object[key] !== null) {
      httpParams = httpParams.set(key, object[key]);
    }
  });

  return httpParams;
}
