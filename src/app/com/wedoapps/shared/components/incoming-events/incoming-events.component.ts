import {Component, OnDestroy, OnInit} from '@angular/core';
import {EventModel, ServerResponse} from '../../../models';
import {takeUntil} from 'rxjs/operators';
import {InitialService} from '../../../views/main/initial/initial.service';
import {Subject, Subscription} from 'rxjs';
import {AppService} from '../../../../../app.service';
import {GoogleApiService, SubjectsInteractionsService, UtilitesService} from '../../../services';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-incoming-events',
    templateUrl: './incoming-events.component.html',
    styleUrls: ['./incoming-events.component.scss']
})
export class IncomingEventsComponent implements OnInit, OnDestroy {
    public hideIncomingEvents: boolean = true;
    public removeIncomingEvent: boolean = false;
    public incomingEvent: EventModel;
    public incomingEvents: Array<EventModel>;
    public isAuthorized: boolean;
    public loading: boolean = true;
    private _incomingEventsLength: number = 0;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private subscription: Subscription;
    public lat: number = null;
    public lon: number = null;
    public place: string = 'switzerland';
    public defaultDates: any;

    constructor(private _initialService: InitialService,
                private _subjectsIteractionsService: SubjectsInteractionsService,
                private _appService: AppService,
                private _activatedRoute: ActivatedRoute,
                private _googleApi: GoogleApiService,
                private _utilities:UtilitesService,
                private router: Router) {
        this.isAuthorized = this._appService.getIsAuthorized();
        // this._callSections(this.isAuthorized);
        this.getLocation();
        this.defaultDates = this._utilities.getDefaultDates();
    }

    ngOnInit() {
        this._subjectsIteractionsService.authorizationState.subscribe(async (data) => {
            this.isAuthorized = await data.isAuthorized;
            this._callSections(this.isAuthorized);
        });
    }

    private getLocation() {
        this._googleApi.getUserLocation
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(location => {
                let latLon = '';
                if (location && location.lat) {
                    this.lat = location.lat;
                    this.lon = location.lon;
                    latLon = `?lat=${this.lat}&lon=${this.lon}`;
                    this._callSections(this.isAuthorized, latLon);
                    this.getPlace()
                }
            });
    }

    private getPlace(){
        this._subjectsIteractionsService.$userPlace
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(location => {
                if(location){
                    this.place = location.place;
                }
            })
    }

    public changeIncomingEvent(eventNum): void {
        if (this._incomingEventsLength <= eventNum.eventNum) {
            this.hideIncomingEvents = true;
        } else {
            this.removeIncomingEvent = true;
            setTimeout(() => {
                this.incomingEvent = this.incomingEvents[eventNum.eventNum];
        }, 500);
        }
        setTimeout(() => {
            this.removeIncomingEvent = false;
        }, 1000);
    }


    private _callSections(authorized: boolean, url: string = ''): void {
        if (authorized) {
            if (this.router.url === '/basic/interests') {
                this._getIncomingEvent(`users/get-incoming-events-interested-page${url}`, 0);
            } else {
                this._getIncomingEvent(`events/incoming-events${url}`, 0);
            }
        }
    }

    private _getIncomingEvent(url, eventNum: number): void {
        this.hideIncomingEvents = false;
        this._initialService
            .getIncomingEvent(url)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data: ServerResponse<EventModel[]>) => {
                this._incomingEventsLength = data.data.length;
                this.incomingEvent = data.data[0];
                this.incomingEvents = data.data;
                if (this._incomingEventsLength === 0) {
                    this.hideIncomingEvents = true;
                }
                this.loading = false;
            }, (err) => {
                this.loading = false;
            });
    }


    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
