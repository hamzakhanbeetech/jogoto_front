import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SubjectsInteractionsService} from './subjects-interactions.service';

@Injectable({
    providedIn: 'root'
})
export class CheckCookiesService {

    constructor(private _subjectsInteractionsService: SubjectsInteractionsService) {
    }

    public checkCookies() {
        setTimeout(()=>{
            let data: any = {};
            data.type = 'cookies';
            data.messageText = 'cookie_text';
            data.display = true;
            if (!sessionStorage.getItem('cookies')) {
                this._subjectsInteractionsService.errorSuccessMessag.next(data);
            }
        },1000)
    }
}
