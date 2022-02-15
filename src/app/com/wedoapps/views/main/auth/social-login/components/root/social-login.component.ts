import {Router} from '@angular/router';
import {AfterViewChecked, Component, Input, NgZone, OnInit} from '@angular/core';

import {SocialUser} from '../../../registration/registration.models';
import {ServerResponse, UserDataModel} from '../../../../../../models';
import {SubjectsInteractionsService, UtilitesService} from '../../../../../../services';
import {RegistrationService} from '../../../registration/registration.service';
import {environment} from '../../../../../../../../../environments/environment';
import {SocialLoginService} from '../../../../../../services/social-login.service';
import {TranslateService} from "@ngx-translate/core";
import * as jwt_decode from 'jwt-decode';

declare const FB: any;
declare const gapi: any;
declare const AppleID: any;

@Component({
    selector: 'app-social-login',
    templateUrl: './social-login.component.html',
    styleUrls: ['./social-login.component.scss']
})

export class SocialLoginComponent implements OnInit, AfterViewChecked  {
    public auth2: any;
    public latLon: any;
    private fbAccessToken: string;
    public showFbBtn:boolean = true;
    @Input('activeRadioButtonName') public activeRadioButtonName = 'user';

    @Input('latLon') set getLatLon(data) {
        this.latLon = data;
    }

    constructor(private registrationService: RegistrationService,
                private _subjectsIteractionsService: SubjectsInteractionsService,
                private  _router: Router,
                private _ngZone:NgZone,
                private _translate: TranslateService,
                private _socialService: SocialLoginService,
                private _utilitiesService:UtilitesService) {
    }

    ngOnInit() {
        this._googleInit();
        if(document.getElementById('facebook-jssdk')){
            this.showFbBtn = false;
        }
        this._socialService.fbInit(true).subscribe(data => {
                    this._ngZone.run(()=>{
                        this.showFbBtn = false;
                    })
        });
    }

 async appleSingIn(event){
   event.preventDefault();
   event.stopPropagation();
    try {
      const data = await AppleID.auth.signIn();
      const user: any = {};
      if(this.latLon){
        data.location = this.latLon;
      }
      if(data.user){
        user.name = data.user.name.firstName;
        user.surname = data.user.name.lastName;
        user.email = data.user.email || '';
      }
      if(data.authorization){
        user.appleToken = data.authorization.id_token;
        const token = jwt_decode(data.authorization.id_token);
        user.appleId = token.sub;
        this._sendRequest(user, 'apple')
      }
    } catch ( error ) {
      console.log(error);
    }
  }

    private _googleInit(): void {
      gapi.load('auth2', () => {
            const oauthOptions = environment.oauth2.google;

            this.auth2 = gapi.auth2.init({
                client_id: oauthOptions.client_id,
                cookiepolicy: oauthOptions.cookiepolicy,
                scope: oauthOptions.scope
            });

            this._attachSignin(document.getElementById('googleBtn'));
        });
    }

  ngAfterViewChecked(): void {
    AppleID.auth.init({
          clientId : 'web.jogoto.com',
          scope : 'name email',
          redirectURI : 'https://jogoto.com/auth/login',
          usePopup : true
        });
  }

    private _attachSignin(element): void {
        this.auth2.attachClickHandler(element, {},
            (googleUser) => {
                const gUser = googleUser.getBasicProfile();
                const image = gUser.getImageUrl().slice(0, gUser.getImageUrl().lastIndexOf('=')) + '=s500-c';
                let user: SocialUser = {
                    googleToken: googleUser.getAuthResponse().id_token,
                    googleId: gUser.getId(),
                    name: gUser.getGivenName(),
                    surname: gUser.getFamilyName(),
                    email: gUser.getEmail(),
                    imageLink: image
                };

                if (this.latLon) {
                    user.location = this.latLon;
                }
                this._sendRequest(user, 'google');
            });
    }

    public fbLogin() {
      this._socialService.fbLogin().subscribe(data=>{
        if(this.latLon){
                data.location = this.latLon;
            }
            this._sendRequest(data, 'facebook')
        })
    }

    private _sendRequest(user: SocialUser, type: string) {
        let lang = localStorage.getItem('currentLanguage') || this._translate.currentLang;
      if(!lang)lang = 'en';
        user.lang = lang;
      if(user.email || user.appleId){
            this.registrationService.signInSocial(user, type)
                .subscribe((data: ServerResponse<UserDataModel>) => {
                  if(data.info.popup){
                        user.name = data.data.name;
                        user.surname = data.data.surname;
                        user.imageLink = data.data.poster.min;
                        this.setSocialUser(user)
                    }else{
                      this._utilitiesService._setUserState(data);
                    }
                });
        }else {
          this.setSocialUser(user)
        }
    }

    private setSocialUser(user){
      localStorage.setItem('social_user_data', JSON.stringify(user));
      localStorage.setItem('currentLanguage',user.lang);
      this._translate.use(user.lang);
        this._subjectsIteractionsService.socialLoginUser.next({user,isMerging:true});
       this._ngZone.run(()=>{
         const localisedUrl = this._utilitiesService.localizeRouter('auth/merge-accounts');
         this._router.navigate([localisedUrl]);
       })
    }
}

