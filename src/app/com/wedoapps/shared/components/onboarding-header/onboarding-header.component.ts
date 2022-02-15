import {Component, OnDestroy, OnInit, AfterViewInit} from '@angular/core';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {GoogleApiService, SubjectsInteractionsService, UtilitesService} from '../../../services';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-onboarding-header',
  templateUrl: './onboarding-header.component.html',
  styleUrls: ['./onboarding-header.component.scss'],
})
export class OnboardingHeaderComponent implements OnInit, OnDestroy {
    public searchIcon: boolean = true;
    public language = this._translate.currentLang;
    private unsubscribe$: Subject<void> = new Subject<void>();
    public lat:number;
    public lon:number;
    public place:string;
    public defaultDates: any;

    public lines: Array<string> = [];

  constructor(
        private _translate: TranslateService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _googleApi: GoogleApiService,
        private _utilitiesService:UtilitesService,
        private _subjectInteractions:SubjectsInteractionsService
    ) {
    }

    ngOnInit() {
      this.defaultDates = this._utilitiesService.getDefaultDates();
      const lang  = this._translate.currentLang || localStorage.getItem('currentLanguage');
      this.checkLang(lang);
        if (this._router.url === '/' || this._router.url.match('/search')) {
            this.searchIcon = false;
        } else {
            this.searchIcon = true;
            this.getLocation();
        }
        this._router.events
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (event) => {
                // example: NavigationStart, RoutesRecognized, NavigationEnd
                if (event instanceof RoutesRecognized) {
                    if (event.url === '/' || event.url.match('/search')) {
                        this.searchIcon = false;
                    } else {
                        this.searchIcon = true;
                        this.getLocation();
                    }
                }
            });
    }

    public useLanguage(language: string): void {
      this._translate.use(language);
        localStorage.setItem('currentLanguage', language);
        this.checkLang(language);
    }

    private checkLang(lang) {
        if (lang) {
            this.language = lang;
            this._subjectInteractions.changeLang(lang)
        }
    }

    private getLocation(){
        if(!this.lat){
            this._googleApi.getUserLocation
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(location =>{
                    if(location){
                      if(!!location.place){
                            this.lat = location.lat;
                            this.lon = location.lon;
                            this.place = location.place;
                        }else{
                            this.getPlace(location.lat,location.lon)
                        }
                    }
                })
        }
    }

    private getPlace(lat, lon){
        this._googleApi.findPlaceByCoordinates(lat,lon).pipe(takeUntil(this.unsubscribe$))
            .subscribe(({value}) =>{
                this.lat = lat;
                this.lon = lon;
                this.place = value;
            })
    }

    ngOnDestroy(){
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
