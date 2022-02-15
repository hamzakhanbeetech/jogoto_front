import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {RegistrationService} from '../../../registration/registration.service';
import {SubjectsInteractionsService, UtilitesService} from '../../../../../../services/index';
import {Subject} from 'rxjs';
import {LoginService} from '../../../login/login.service';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-marging-accounts',
    templateUrl: './marging-accounts.component.html',
    styleUrls: ['./marging-accounts.component.scss']
})
export class MargingAccountsComponent implements OnInit {
    public user: any;
    public loading: boolean = false;
    public servErr: string;
    public email: string;
    public connectBtn:string = "CONNECT";
    public password: FormControl = new FormControl('',
        [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(new RegExp('\\S'))
        ]);
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private registrationService: RegistrationService,
                private _loginService: LoginService,
                private _translate: TranslateService,
                private _utilitiesService: UtilitesService,
    ) {
    }

    ngOnInit() {
        this.checkMerging();
        this._translate.stream('marging.connect').subscribe((ev)=>{
          this.connectBtn = ev;
        })
    }

    private checkMerging() {
        const user = JSON.parse(localStorage.getItem('social_user_data'));
        if (user) {
            this.user = user;
            this.email = user.email;
        }
    }

    public isFormValid(): boolean {
        return this.password.invalid && this.password.touched;
    }

    public onConnect() {
        this.loading = true;
        let lang = localStorage.getItem('currentLanguage');
        if (!lang) {
          lang = 'en';
        }
        let socialData: any = {};
        if (this.user.googleToken) {
            socialData = {
                googleToken: this.user.googleToken,
                googleId: this.user.googleId
            };
        } else if (this.user.facebookToken) {
            socialData = {
                facebookToken: this.user.facebookToken,
                facebookId: this.user.facebookId
            };
        }else{
          socialData = {
            appleToken: this.user.appleToken,
            appleId: this.user.appleId
          };
        }
        this._loginService.userLogin(
            this.email,
            this.password.value,
            this._utilitiesService.checkDevice(),
            lang,
            socialData)
            .subscribe(data => {
                this.removeSocialUser();
                this._utilitiesService._setUserState(data);
                this.loading = false;
            }, err => {
                this.password.markAsPristine();
                this.servErr = err.error.error.message;
                this.loading = false;
            });
    }

    public removeSocialUser() {
        localStorage.removeItem('social_user_data');
    }

    public getEmail(user) {
        this.user = user;
        this.email = user.email;
        localStorage.setItem('social_user_data', JSON.stringify(user));
    }

}
