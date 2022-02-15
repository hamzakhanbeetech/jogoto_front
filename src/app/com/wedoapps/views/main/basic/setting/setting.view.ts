import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {ServerResponse, UserModel} from '../../../../models';
import {LinkedinService, SubjectsInteractionsService, UserService, UtilitesService} from '../../../../services';
import {AppService} from '../../../../../../app.service';
import {MainService} from '../../main.service';
import {CookieService} from 'ngx-cookie';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SocialLoginService} from '../../../../services/social-login.service';
import {authConfig} from '../../../../params/auth.config';
import {auth} from 'firebase/app';
import {TabsetComponent} from 'ngx-bootstrap';

@Component({
    selector: 'app-setting',
    templateUrl: './setting.view.html',
    styleUrls: ['./setting.view.scss']
})
export class SettingView implements OnInit, OnDestroy {
    public user: UserModel;
    public emailForm: FormGroup;
    public passForm: FormGroup;
    public deleteAccountForm: FormGroup;
    public notifyGroup: FormGroup;
    public loaders = {
        isUpdateEmail: false,
        isUpdatePasswrod: false,
        isCloseAccount: false,
        isLoading: false
    };
    public errors = {
        email: {
            message: '',
            status: null
        },
        password: {
            message: '',
            status: null
        },
        closeAccount: {
            message: '',
            status: null
        },
        saveSettings: {
            message: '',
            status: null
        }
    };
    public languages = [
        {label: 'English', value: 'en'},
        {label: 'Français', value: 'fr'},
    ];
    public hasDeleteReason = false;
    public reasons: any[] = [
        {
            name: 'duplicate_account',
            checked: false
        },
        {
            name: 'many_emails',
            checked: false
        },
        {
            name: 'getting_membership',
            checked: false
        },
        {
            name: 'privacy_concern',
            checked: false
        },
        {
            name: 'unwanted_contact',
            checked: false
        },
        {
            name: 'other',
            checked: false
        }
    ];
    public notifySettingsList = [
        {
            title: 'reminders',
            sub_title: '',
            formControlName: 'reminders'
        },
        {
            title: 'events',
            sub_title: '',
            formControlName: 'events'
        },
        {
            title: 'groups',
            sub_title: '',
            formControlName: 'groups'
        },
        {
            title: 'pages',
            sub_title: '',
            formControlName: 'pages'
        },
        {
            title: '',
            sub_title: 'when_user_clicks',
            formControlName: 'interested'
        },
        {
            title: '',
            sub_title: 'when_user_adds',
            formControlName: 'email'
        },
        {
            title: '',
            sub_title: 'when_administrator',
            formControlName: 'admin_moder'
        },
        {
            title: '',
            sub_title: 'when_user',
            formControlName: 'follow_group'
        },
        {
            title: '',
            sub_title: 'when_user_joins',
            formControlName: 'join_group'
        },
    ];
    public isEnabledJogoto = false;
    public isEnabledPush = false;
    public isSelectedNotifications = false;
    public fbChecked: boolean;
    public userPassword: boolean;
    public userType: boolean;
    private $unsubscribe: Subject<void> = new Subject();
    public twChecked: boolean;
    public linkedinChecked: boolean;
    public savePassword: string;
    public changePassword: string;
    public successfullyCreatedMessage: string;
    public langDropdown: FormControl = new FormControl();
    public skipLimit = {
        users: {
            oldSkip: 0,
            skip: 0,
            deleteSkip: 0,
            limit: 6
        },
        events: {
            oldSkip: 0,
            skip: 0,
            deleteSkip: 0,
            limit: 6
        },
        groups: {
            oldSkip: 0,
            skip: 0,
            deleteSkip: 0,
            limit: 6
        }
    };
    public noResults = {
        users: {
            icon: 'icon-search-user',
            text: ''
        },
        events: {
            icon: 'icon-calendar',
            text: ''
        },
        groups: {
            icon: 'icon-group',
            text: ''
        }
    };
    public users = [];
    public events = [];
    public groups = [];
    public loading: boolean = false;
    public sectionCount:number = 0;
    @ViewChild('tabset', { static: true }) tabset: TabsetComponent;


    constructor(private translate: TranslateService,
                private _userService: UserService,
                private _mainService: MainService,
                private _appService: AppService,
                private _subjectsIteractionsService: SubjectsInteractionsService,
                private _activeRoute: ActivatedRoute,
                private _cookieService: CookieService,
                private _router: Router,
                private _fb: FormBuilder,
                private socialService: SocialLoginService,
                private userService: UserService,
                private _ngZone: NgZone,
                private _linkedinService: LinkedinService,
                private _utilitiesService: UtilitesService
    ) {
        this.emailForm = this._fb.group({
            email: ['', [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/)]],
        });

        this.passForm = this._fb.group({
            password: this.userPassword ? ['', [Validators.required, Validators.minLength(6)]] : null,
            new_password: ['', [Validators.required, Validators.minLength(6)]],
            re_password: ['', [Validators.required, Validators.minLength(6)]],
        }, {validator: this._matchingPasswords('new_password', 're_password')});

        this.deleteAccountForm = this._fb.group({
            text: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.notifyGroup = this._fb.group({
            'reminders': [{value: false, disabled: !this.isEnabledJogoto}],
            'groups': [{value: false, disabled: !this.isEnabledJogoto}],
            'interested': [{value: false, disabled: !this.isEnabledJogoto}],
            'admin_moder': [{value: false, disabled: !this.isEnabledJogoto}],
            'join_group': [{value: false, disabled: !this.isEnabledJogoto}],
            'events': [{value: false, disabled: !this.isEnabledJogoto}],
            'pages': [{value: false, disabled: !this.isEnabledJogoto}],
            'email': [{value: false, disabled: !this.isEnabledJogoto}],
            'follow_group': [{value: false, disabled: !this.isEnabledJogoto}],
            'p-reminders': [{value: false, disabled: !this.isEnabledPush}],
            'p-groups': [{value: false, disabled: !this.isEnabledPush}],
            'p-interested': [{value: false, disabled: !this.isEnabledPush}],
            'p-admin_moder': [{value: false, disabled: !this.isEnabledPush}],
            'p-join_group': [{value: false, disabled: !this.isEnabledPush}],
            'p-events': [{value: false, disabled: !this.isEnabledPush}],
            'p-pages': [{value: false, disabled: !this.isEnabledPush}],
            'p-email': [{value: false, disabled: !this.isEnabledPush}],
            'p-follow_group': [{value: false, disabled: !this.isEnabledPush}],
        });
        this.translate.onLangChange.pipe(
            takeUntil(this.$unsubscribe)
        ).subscribe((ln) => {
          this.noResults.events.text =this.translate.instant('no-result.no_events_show');
          this.noResults.groups.text = this.translate.instant('no-result.no_groups_show');
          this.noResults.users.text = this.translate.instant('no-result.no_users_show');
            if (ln.lang === 'fr') {
                this.langDropdown.setValue({label: 'Français', value: 'fr'});
            } else {
                this.langDropdown.setValue({label: 'English', value: 'en'});

            }
        });
    }

    ngOnInit() {
        this.translate.get(['settings.password_changed', 'settings.password_saved', 'settings.successfully_created_message', 'no-result.no_events_show', 'no-result.no_groups_show', 'no-result.no_users_show']).subscribe((translated) => {
            this.savePassword = translated['settings.password_saved'];
            this.changePassword = translated['settings.password_changed'];
            this.successfullyCreatedMessage = translated['settings.successfully_created_message'];
            this.noResults.events.text = translated['no-result.no_events_show'];
            this.noResults.groups.text = translated['no-result.no_groups_show'];
            this.noResults.users.text = translated['no-result.no_users_show'];
        });
        this.getIdToken();
        this.socialService.fbInit();
        this.user = JSON.parse(localStorage.getItem('user_data'));
        let email = this.user.email;

        if (email == undefined) {
            email = '';
        }
        this.emailForm.setValue({email});

        this._userService.getUserNotificationsSettings()
            .subscribe(res => {
                this.fbChecked = res.data.facebookAutoShare;
                this.userPassword = res.data.userPassword;
                this.twChecked = res.data.twitterAutoShare;
                this.linkedinChecked = res.data.linkedinAutoShare;
                this.userType = res.data.register_type === 'professional';
                const jogoto = res.data.notifications.jogoto,
                    push = res.data.notifications.push,
                    controls = this.notifyGroup.controls,
                    lang = [
                        {label: 'Français', value: 'fr'},
                        {label: 'English', value: 'en'},
                    ];

                if (jogoto.length > 0) {
                    this.isEnabledJogoto = true;

                    jogoto.forEach((key) => {
                        controls[key].patchValue(true);
                    });

                    Object.keys(controls).forEach(key => {
                        if (!key.startsWith('p-')) {
                            controls[key].enable();
                        }
                    });
                }

                if (push.length > 0) {
                    this.isEnabledPush = true;

                    push.forEach((key) => {
                        controls['p-' + key].patchValue(true);
                    });

                    Object.keys(controls).forEach(key => {
                        if (key.startsWith('p-')) {
                            controls[key].enable();
                        }
                    });
                }

                if (res.data.language === 'fr') {
                    this.languages = lang;
                }
            }, err => {
                console.log(err);
            });

        this._activeRoute.queryParams
            .pipe(
                takeUntil(this.$unsubscribe)
            )
            .subscribe(param => {
                if (param.active) {
                    this.isSelectedNotifications = true;
                }
            });
        this._subjectsIteractionsService.pageTags.next({title: `tags.settings_title`, desc: `tags.settings_desc`});
        this._subjectsIteractionsService.unblockEventState.pipe(
            takeUntil(this.$unsubscribe)
        ).subscribe((eventId) => {
            this.events = this.events.filter(event => event._id !== eventId);
            this.sectionCount--;
            if(this.sectionCount >= this.skipLimit.events.limit && this.sectionCount !== this.groups.length){
                this.getBlockedSection(false, true, 'events');
            }
        });
        this._subjectsIteractionsService.unblockGroupState.pipe(
            takeUntil(this.$unsubscribe)
        ).subscribe((eventId) => {
            this.groups = this.groups.filter(event => event._id !== eventId);
            this.sectionCount--;
            if(this.sectionCount >= this.skipLimit.groups.limit && this.sectionCount !== this.groups.length){
                this.getBlockedSection(false, true, 'groups');
            }
        });
    }

    public updateUserInfo(): void {
        const body = {
            email: this.emailForm.get('email').value
        };
        this.loaders.isUpdateEmail = true;

        this._userService.updateEmail(body)
            .subscribe(res => {
                if (!res.info.error) {
                    this.loaders.isUpdateEmail = false;
                    this._subjectsIteractionsService.errorSuccessMessag
                        .next({
                            type: 'success',
                            messageText: `${this.successfullyCreatedMessage} ${this.emailForm.get('email').value}`,
                            display: true
                        });

                    this._mainService.getUsersLogOut()
                        .pipe(
                            takeUntil(this.$unsubscribe)
                        )
                        .subscribe((data: ServerResponse<{}>) => {
                            this._cookieService.removeAll();
                            this._appService.setIsAuthorized(false);
                            localStorage.clear();
                            this._subjectsIteractionsService.authorization.next({
                                isAuthorized: false
                            });
                            this._subjectsIteractionsService.changeUserState(false);
                            window.scrollTo(0, 0);
                        });

                    setTimeout(() => {
                        const localisedUrl = this._utilitiesService.localizeRouter('/auth/login');
                        this._router.navigateByUrl(localisedUrl);
                    }, 2000);
                }
                this.errors.email = res.error;
            }, err => {
                this._subjectsIteractionsService.errorSuccessMessag
                    .next({
                        type: 'error',
                        messageText: `${err.error.error.message}`,
                        display: true
                    });
                this.loaders.isUpdateEmail = false;
                this.errors.email = err.error.error.message;
            });
    }

    public changeUserPassword(): void {
        this.loaders.isUpdatePasswrod = true;
        const body = {
            ...this.passForm.getRawValue(),
        };
        if (!this.userPassword) {
            this._userService.saveUserPassword(body)
                .subscribe(res => {
                    if (!res.info.error) {
                        this.loaders.isUpdatePasswrod = false;
                        this._subjectsIteractionsService.errorSuccessMessag
                            .next({type: 'success', messageText: this.savePassword, display: true});
                        this.userPassword = true;
                        this.user.userPassword = this.userPassword;
                        localStorage.setItem('user_data', JSON.stringify(this.user));
                        this.passForm.reset();
                    }
                    this.errors.password = res.error;
                }, err => {
                    this.errors.password = err.error.error;
                    this.loaders.isUpdatePasswrod = false;
                });
        } else {
            this._userService.changeUserPassword(body)
                .subscribe(res => {
                    if (!res.info.error) {
                        this.loaders.isUpdatePasswrod = false;
                        this._subjectsIteractionsService.errorSuccessMessag
                            .next({type: 'success', messageText: this.changePassword, display: true});
                        this.passForm.reset();
                    }
                    this.errors.password = res.error;
                }, err => {
                    this.errors.password = err.error.error;
                    this.loaders.isUpdatePasswrod = false;
                    console.log(err);
                });
        }

    }

    public changeLang(e): void {
        const body = {
            lang: e.value.value,
        };

        this._userService.changeAppLang(body)
            .subscribe(res => {
                this.translate.use(e.value.value);
                localStorage.setItem('currentLanguage', e.value.value);
                this._subjectsIteractionsService.changeLang(e.value.value);
            }, err => {
                console.log(err);
            });
    }

    public changeNotificationsSettingsAll(type: string): void {
        const controls = this.notifyGroup.controls;

        if (type === 'jogoto') {
            this.isEnabledJogoto = !this.isEnabledJogoto;
            Object.keys(controls).forEach(key => {
                if (!key.startsWith('p-')) {
                    controls[key].setValue(this.isEnabledJogoto);
                    if (this.isEnabledJogoto) {
                        this.notifyGroup.get(key).enable();
                    } else {
                        this.notifyGroup.get(key).disable();
                    }
                }
            });
        } else {
            this.isEnabledPush = !this.isEnabledPush;
            Object.keys(controls).forEach(key => {
                if (key.startsWith('p-')) {
                    controls[key].setValue(this.isEnabledPush);
                    if (this.isEnabledPush) {
                        this.notifyGroup.get(key).enable();
                    } else {
                        this.notifyGroup.get(key).disable();
                    }
                }
            });
        }
    }

    public deleteUserAccount(): void {
        this.loaders.isCloseAccount = true;
        const body: { text: string, password: string } = {
            ...this.deleteAccountForm.getRawValue()
        };
        this._userService.deleteUser(body)
            .subscribe(res => {
                this.loaders.isCloseAccount = false;
                this._cookieService.removeAll();
                localStorage.clear();
                this._router.navigateByUrl('/');
                location.reload();
            }, err => {
                this.loaders.isCloseAccount = false;
                this.errors.closeAccount.message = err.error.error.message;
            });
    }

    public saveNotificationsSettings(): void {
        const controls = this.notifyGroup.controls;
        const body = {
            jogoto: [],
            push: []
        };

        Object.keys(controls).forEach(key => {
            if (key.startsWith('p-') && this.notifyGroup.get(key).value) {
                body.push.push(key.slice(2));
            } else if (!key.startsWith('p-') && this.notifyGroup.get(key).value) {
                body.jogoto.push(key);
            }
        });

        this.changeSettings(body);
    }

    public resetCheckedReason(index: number): void {
        this.reasons.forEach(res => {
            res.checked = false;
        });

        this.reasons[index].checked = true;
        const translatedText = this.translate.instant('settings.' + this.reasons[index].name);

        this.deleteAccountForm.patchValue({
            text: translatedText
        });
    }

    public setReason(e: any): void {
        const reason = e.target.value;

        this.deleteAccountForm.patchValue({
            text: reason
        });
    }

    private changeSettings(body: any) {
        this.loaders.isLoading = true;
        this._userService.updateUserNotoficationsSettings(body)
            .subscribe(res => {
                if (!res.info.error) {
                    this.loaders.isLoading = false;
                } else {
                    this.errors.saveSettings = res.error;
                }
            }, err => {
                this.translate.get('settings.something_went_wrong').subscribe(translate => {
                    this.errors.saveSettings['message'] = translate;
                });
                this.loaders.isLoading = false;
            });
    }

    private _matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
        return (group: FormGroup): { [key: string]: any } => {
            const password = group.controls[passwordKey];
            const confirmPassword = group.controls[confirmPasswordKey];
            if ((password.value !== confirmPassword.value) && password.dirty && confirmPassword.dirty) {
                return {
                    mismatchedPasswords: true
                };
            }
        };
    }

    public submitFacebookLogin(e): void {
        this.fbChecked = e.checked;
        const isconnected = this.fbChecked ? 'enable' : 'disable';
        const body = {
            facebookAutoShare: isconnected
        };
        this.userService.putFacebookAutoShare(body).subscribe(data => {
        }, err => {
            console.log(err);
        });
    }

    public submitTwitterLogin(e) {
        this.twChecked = e.checked;
        const body: any = {
            accessKey: '',
            accessToken: ''
        };
        if (this.twChecked) {
            this.userService.AuthLogin(new auth.TwitterAuthProvider()).subscribe(({credential}) => {
                body.accessKey = credential.accessToken;
                body.accessToken = credential.secret;
                this.sendTwitterReq(body);
            });
        } else {
            this.userService.disconnectSocial({}, `twitter-disconnect?u_id=${this.user._id}`)
                .subscribe(data => {
                }, err => {
                    console.log(err);
                });
        }
    }


    private sendTwitterReq(body) {
        this.userService.connectTwitter(body).subscribe(data => {
        }, err => {
            console.log(err);
        });
    }

    public linkedinLogin(e) {
        const url = `${authConfig.issuer}/authorization?response_type=code&client_id=${authConfig.clientId}&scope=${authConfig.scope}&redirect_uri=${authConfig.redirectUri}`;
        this.linkedinChecked = e.checked;
        if (e.checked) {
            location.href = url;
        } else {
            this.userService.disconnectSocial({}, `linkedin-disconnect?u_id=${this.user._id}`)
                .subscribe(data => {
                }, err => {
                    console.log(err);
                });
        }
    }

    public getIdToken(): void {
        this._activeRoute.queryParams.subscribe(params => {
            if (params.code) {
                const localisedUrl = this._utilitiesService.localizeRouter('/basic/settings');
                this._router.navigateByUrl(localisedUrl);
                const url = `https://cors-anywhere.herokuapp.com/${authConfig.issuer}/accessToken?grant_type=authorization_code&redirect_uri=${authConfig.redirectUri}&client_id=${authConfig.clientId}&client_secret=${authConfig.clientSecret}&code=${params.code}`;
                this._linkedinService.sendRequest(params.code, url).subscribe((data) => {
                    this._linkedinService.getLinkedinUserData(data.access_token).subscribe(data => {
                        this.linkedinChecked = true;
                    });
                });
            }
        });
    }

    public getSectionTab(type:string){
        this.skipLimit[type].skip = 0;
        this[type] = [];
        this.getBlockedSection(false, false, type);
    }

    private getBlockedSection(isScroll = false, isDeleted = false, type: string) {
        this.loading = true;
        let limit = 6;
        let skip = this.skipLimit[type].skip;
        if (isScroll) {
            this.skipLimit[type].skip += this.skipLimit[type].limit + 1;
            skip = this.skipLimit[type].skip;
        }
        if (isDeleted) {
            skip = this[type].length + 1;
            limit = 1;
        }
        this._userService.getBlockedData(this.user._id, skip, limit, type).subscribe(events => {
            events.data.map((event) => {
                this[type].push(event);
            });
            this.sectionCount = events.info.count;
            this.loading = false;
        });
    }

    public unblockUser(id) {
        this.users = this.users.filter(user => user._id !== id);
        this.sectionCount--;
        if(this.sectionCount >= this.skipLimit.users.skip && this.sectionCount !== this.users.length){
            this.getBlockedSection(false, true, 'users');
        }
    }

    public onScroll(type) {
        if (type == 'group') {
            this.getBlockedSection(true, false, 'groups');
        } else if (type === 'events') {
            this.getBlockedSection(true, false, 'events');
        } else if (type === 'users') {
            this.getBlockedSection(true, false, 'users');
        }
    }

    ngOnDestroy() {
        this.$unsubscribe.next();
        this.$unsubscribe.complete();
    }
}
