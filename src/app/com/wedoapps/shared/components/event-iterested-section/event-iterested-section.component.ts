import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Router } from '@angular/router';

import { EventModel, ServerResponse, UserModel } from '../../../models/global.models';
import { InitialService } from '../../../views/main/initial/initial.service';
import { AppService } from '../../../../../app.service';
import {SubjectsInteractionsService, UserService, UtilitesService} from '../../../services';

@Component({
    selector: 'app-event-iterested-section',
    templateUrl: './event-iterested-section.component.html',
    styleUrls: ['./event-iterested-section.component.scss']
})
export class EventIterestedSectionComponent implements OnInit, OnDestroy {
    @Input('isInterested') public isInterested: boolean = false;
    @Input('joinedUsers') public joinedUsers: Array<UserModel> = [];
    @Input('eventId') private _eventId: string;
    @Input('isShowUserIcons') public isShowUserIcons: boolean = true;
    @Input('userIsLoggedIn') public userIsLoggedIn: boolean = true;
    @Input('iAmOrgnizer') public iAmOrgnizer: boolean = false;
    @Input('isSettingsPage') public isSettingsPage: boolean = false;
    private _subscription: Subscription = new Subscription();

    constructor(
        private _initialService: InitialService,
        private _subjectInter: SubjectsInteractionsService,
        private _route: Router,
        private _appService: AppService,
        private _usersService:UserService,
        private utilitesService: UtilitesService
    ) {
    }

    ngOnInit() {
        this.userIsLoggedIn = this._appService.getIsAuthorized();
    }

    public joinToEvent(): void {
        if (!this.isInterested && !this.iAmOrgnizer && this.userIsLoggedIn) {
            this._subscription = this._initialService.joinToEvent(this._eventId)
                .subscribe((data: ServerResponse<UserModel>) => {
                    this.joinedUsers.push(data.data);
                    this.isInterested = true;
                }, (err) => {
                });
        } else if (this.userIsLoggedIn) {
          const localisedUrl = this.utilitesService.localizeRouter(`/event/${this._eventId}`);
          this._route.navigate([localisedUrl]);
        } else {
          const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
          this._route.navigate([localisedUrl], { queryParams: { event: this._eventId } });
        }
    }

    public unblockEvent(){
         this._usersService.unblockData(this._eventId, 'events')
            .subscribe((data: ServerResponse<any>) => {
                this._subjectInter.unblockEvent.next(this._eventId)
            }, (err) => {
            });
    }

    ngOnDestroy() {
        if (this.userIsLoggedIn) {
            this._subscription.unsubscribe();
        }
    }
}
