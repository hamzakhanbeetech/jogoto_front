import {Component, OnInit, OnDestroy} from '@angular/core';
import {AppService} from '../../../../app.service';
import {SubjectsInteractionsService} from '../../services/subjects-interactions.service';
import {Subscription} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {CheckCookiesService} from '../../services/check-cookies.service';
import {UtilitesService} from "../../services";
import {TranslateService} from "@ngx-translate/core";
import {Location} from "@angular/common";
declare const gtag;
@Component({
    selector: 'main-view',
    templateUrl: 'main.view.html',
    styleUrls: ['main.view.scss'],
})
export class MainView implements OnInit, OnDestroy {
    public isAuthorized: boolean = false;
    private _subscription: Subscription = new Subscription();
    private _cookiesubscription: Subscription = new Subscription();

    constructor(private _appService: AppService,
                private _subjectsInteractionsService: SubjectsInteractionsService,
                private utilitesService:UtilitesService,
                private _checkCookies:CheckCookiesService,
                private translate : TranslateService,
                private location: Location,
                private _router:Router,
                ) {
        this.isAuthorized = this._appService.getIsAuthorized();
        this._subscription = this._subjectsInteractionsService.authorizationState.subscribe(async (data) => {
            this.isAuthorized = await data.isAuthorized;
        });
    }

    ngOnInit() {
      // this._router.events.pipe(
      //   filter(event => event instanceof NavigationEnd)
      // ).subscribe((event:NavigationEnd) => {
        // console.log(event.urlAfterRedirects)
        // gtag('config', 'UA-149369103-1', {
        //   'page_path':event.urlAfterRedirects
        // })
      // });
        this.setCookiesNotification()
      this.translate.onLangChange.subscribe((lang)=>{
        const changedLang  = lang.lang;
        let rowUrl = this.location.path();
        if(this._router.url.length > 3){
          const url = rowUrl.replace(/\/(fr|en)\//gm,'');
          if(rowUrl.substring(1, 3) == 'en' || rowUrl.substring(1, 3) == 'fr'){
            this.location.replaceState(this.utilitesService.localizeRouter(url,changedLang))
          }
          }else{
            this._router.navigateByUrl(`/${changedLang}`)
          }
      })
    }

    private setCookiesNotification(){
        if(!this.isAuthorized){
            this._checkCookies.checkCookies();
            this._cookiesubscription =  this._router.events.pipe(
                filter(event => event instanceof NavigationEnd)
            ).subscribe((event:NavigationEnd) => {
              if(!this.isAuthorized){
                    this._checkCookies.checkCookies()
                }
            });
        }
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this._cookiesubscription.unsubscribe();
    }
}
