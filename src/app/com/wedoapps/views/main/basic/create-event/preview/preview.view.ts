import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EventService} from '../../../event/event.service';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie';
import {EventModel, ServerResponse} from '../../../../../models/global.models';
import {EventDataModel} from '../../../initial/initial.models';
import {CreateEventService} from '../create-event.service';
import {takeUntil} from 'rxjs/operators';
import {SubjectsInteractionsService, UtilitesService} from '../../../../../services';
import {Subject} from 'rxjs';
import {MetafrenzyService} from 'ngx-metafrenzy';

@Component({
    selector: 'app-preview',
    templateUrl: './preview.view.html',
    styleUrls: ['./preview.view.scss']
})
export class PreviewView implements OnInit, OnDestroy {
    public event: any;
    public showMobile: boolean = false;
    public showDesctop: boolean = true;
    public incomingDate: EventDataModel = null;
    public comeData: any;
    public description: string;
    public shortText: string = null;
    public showMoreLessDesc: boolean = true;
    public type = {
        'visibility': 'published'
    };
    public locale: string;
    public loading: boolean = false;
    private unsubscribe$: Subject<void> = new Subject<void>();
    public shareCheckBoxes = {
        fb: false,
        linkedIn: false,
        tw:false
    };
    private fbShare = `https://www.facebook.com/sharer/sharer.php?u=`;
    private _baseUrl = 'https://jogoto.com/';

    constructor(private _eventService: EventService,
                private _activedRoute: ActivatedRoute,
                private _cookieService: CookieService,
                private _router: Router,
                private metafrenzyService:MetafrenzyService,
                private _createEventService: CreateEventService,
                private _subjectsInteractionsService: SubjectsInteractionsService,
                private _utilitesServiec: UtilitesService) {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (event.target.innerWidth < 1200) {
            this.showMobile = true;
            this.showDesctop = false;
        } else {
            this.showMobile = false;
            this.showDesctop = true;
        }
    }

    ngOnInit() {
        if (window.innerWidth < 1200) {
            this.showMobile = true;
            this.showDesctop = false;
        } else {
            this.showMobile = false;
            this.showDesctop = true;
        }
        this._getEventId();
        this.checkLang();
    }

    public async getSortedDateLength(ev: any): Promise<void> {
        this.incomingDate = await ev;
        if (!this.event.archive && ev) {
            this.comeData = {
                date: ev.start
            };
        }
    }

    private _getEventId(): void {
        const eventId = this._activedRoute.snapshot.paramMap.get('eventId');
        if (this._cookieService.get('isUpdate')) {
            this._cookieService.remove('isUpdate');
            this.RedirectEditPage(eventId);
        }
        if (eventId) {
            this._getEventById(eventId);
        }
    }

    private _getEventById(id: string): void {
        const u_id = this._cookieService.get('user_id');
        this._eventService.getEvent({id, u_id})
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data: ServerResponse<EventModel>) => {
                const event:any = data.data;
                this.event = event;
                if(event.organizer.register_type == 'professional'){
                    this.shareCheckBoxes.fb = event.organizer.facebookAutoShare;
                    this.shareCheckBoxes.linkedIn = event.organizer.linkedinAutoShare;
                    this.shareCheckBoxes.tw = event.organizer.twitterAutoShare;
                }
                this.setMetaTags(data)
                this._showShortDesc(data.data.description);
            }, err => {
                console.log(err);
                if (err.status === 404) {
                    this._router.navigate(['not-found']);
                }
            });
    }

    public checkShareCheckbox(value, event){
      this.shareCheckBoxes[event] = value.checkboxValue;
    }

    private setMetaTags(data){
        this.metafrenzyService.setTitle(data.data.name);
        const metaDescription = data.data.description.slice(0, 255);
        this.metafrenzyService.setTags({
            title: data.data.name, // setting title and og:title
            description: metaDescription, // setting meta description and og:description
            url: `https://jogoto.com/event/${data.data._id}`, // setting canonical and og:url
            image: data.data.poster.cropped.link // setting og:image:url
        });
        this.metafrenzyService.setMetaTag('twitter:image', data.data.poster.cropped.link );
        this.metafrenzyService.setMetaTag('twitter:title', data.data.name );
        this.metafrenzyService.setMetaTag('twitter:description', metaDescription );
    }

    private _showShortDesc(description: string): void {
        this.description =   this._utilitesServiec.checkHashtags(description);
        if (this.description.length > 800) {
            const rawText = `${this.description.slice(0, description.substring(0, 800).lastIndexOf(' '))}...`;
            this.shortText = rawText;
        }
    }

    public showMoreLessDescription(): void {
        this.showMoreLessDesc = !this.showMoreLessDesc;
    }

    public RedirectEditPage(id: string) {
      const localisedUrl = this._utilitesServiec.localizeRouter('basic/create-event');
      this._router.navigate([localisedUrl], {queryParams: {event_id: id}});
    }

    public publishEvent(id): void {
        const data: any = {...this.type};
        data.twitterChecked = this.shareCheckBoxes.tw;
        data.linkedinChecked = this.shareCheckBoxes.linkedIn;
        this.loading = true;
        this._createEventService.publishEvent(id, data)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(data => {
                this.loading = false;
                const url = `${this._baseUrl}event/${id}`;
                this.openShareWindows(url);
              const localisedUrl = this._utilitesServiec.localizeRouter('event/');
              this._router.navigate([localisedUrl, id]);
            }, err => {
                console.log(err);
            });

    }

    private openShareWindows(url){
            if(this.shareCheckBoxes.fb){
                window.open(this.fbShare + url,'', 'width = 200, height = 200');
            }
    }

    private checkLang() {
        this._subjectsInteractionsService.getCurrentLang()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(lang => {
                this.locale = lang;
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.unsubscribe$.unsubscribe();
    }
}
