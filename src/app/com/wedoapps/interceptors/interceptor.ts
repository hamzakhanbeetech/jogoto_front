import {Injectable} from "@angular/core";
import {HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class LangInterceptor implements HttpInterceptor {

  constructor(private _translate: TranslateService) {
  }
  intercept(
    request: HttpRequest<any>, next: HttpHandler
  ) : Observable<any> {
    const lang  = localStorage.getItem('currentLanguage') || this._translate.currentLang || 'en';
    const modified = request.clone({
      setHeaders: { lang }
    });
    return next.handle(modified);
  }
}
