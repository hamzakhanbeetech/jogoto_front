import {Router} from '@angular/router';
import {Component, OnInit, Input, OnDestroy, Output, EventEmitter} from '@angular/core';

import {ServerResponse, UserModel} from '../../../models/global.models';
import {CookieService} from 'ngx-cookie';
import {UserService, UtilitesService} from '../../../services';

@Component({
    selector: 'app-user-block',
    templateUrl: './user-block.component.html',
    styleUrls: ['./user-block.component.scss']
})
export class UserBlockComponent implements OnInit, OnDestroy {
    @Output()
    public changeFollowings: EventEmitter<any> = new EventEmitter<any>();
    @Output()
    public unblockUser: EventEmitter<any> = new EventEmitter<any>();
    public user: UserModel = {} as UserModel;
    public follow: boolean;
    public isLoading: boolean;
    public _userId: string;

    @Input('isAuthorized')
    public isAuthorized: boolean;
    @Input('isSettingPage')
    public isSettingPage: boolean = false;

    @Input('user')
    private set getUser(user: UserModel) {
        this.user = user;
        this.follow = user.im_follow;
    }

    constructor(
        private _route: Router,
        private _userService: UserService,
        private _cookieService: CookieService,
        private utilitesService: UtilitesService
    ) {
    }


    ngOnInit() {
        this._userId = this._cookieService.get('user_id') || '';
    }

    public onClickFollow(userId: string): void {
        if (this.isAuthorized) {
            this.isLoading = true;
            if (this.follow) {
                this._userService.unfollowFromUser(userId)
                    .subscribe((data: ServerResponse<UserModel>): void => {
                        this.changeFollowings.emit(
                            {
                                increment: false,
                                id: userId
                            });
                        this.follow = data.data.im_follow;
                        this.user = data.data;
                        this.isLoading = false;
                    });
            } else {
                this._userService.followToUser(userId)
                    .subscribe((data: ServerResponse<UserModel>): void => {
                        this.changeFollowings.emit({
                            increment: true,
                            userId: data.data._id,
                        });
                        this.follow = data.data.im_follow;
                        this.user = data.data;
                        this.isLoading = false;
                    });
            }
        } else {
            const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
            this._route.navigate([localisedUrl]);
        }
    }

    public onClickUnblock(userId){
        this.isLoading = true;
        this._userService.unblockData(userId, 'users')
            .subscribe((data: ServerResponse<UserModel>): void => {
                this.unblockUser.emit(userId);
                this.isLoading = false;
            });
    }


    get isShowFollow(): boolean {
        if (this.isAuthorized) {
            if (this._userId === this.user._id) {
                return false;
            }
            return true;
        }
        return true;
    }

    ngOnDestroy() {
    }
}
