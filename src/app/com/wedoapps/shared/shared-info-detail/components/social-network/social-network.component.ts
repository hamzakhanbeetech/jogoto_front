import {Component, Input, NgZone, OnInit} from '@angular/core';
import {environment} from '../../../../../../../environments/environment';
import {SocialLoginService} from '../../../../services/social-login.service';
import {SocialUser} from '../../../../views/main/auth/registration/registration.models';
import {SubjectsInteractionsService, UserService} from '../../../../services';
import {CookieService} from 'ngx-cookie';
import {DeleteComponent} from '../../../../shared/components/modal/delete/delete.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';

declare const gapi: any;
declare const AppleID: any;

@Component({
  selector: 'app-social-network',
  templateUrl: './social-network.component.html',
  styleUrls: ['./social-network.component.scss']
})

export class SocialNetworkComponent implements OnInit {
  public fbId: string;
  public fbToken: string;
  public googleId: string;
  public googleToken: string;
  public fbConnected: boolean = false;
  public appleId: string;
  public appleToken: string;
  public appleConnected: boolean = false;
  public auth2;
  static googleConnected: boolean = false;
  public deleteEventTexts: any;
  private userPassword: boolean;

  @Input('fbData') set getFb(event) {
    if (event && event.id) {
      this.fbId = event.id;
      this.fbToken = event.token;
      this.fbConnected = true;
    }
  }

  @Input('googleData') set getGoogle(event) {
    if (event && event.id) {
      this.googleId = event.id;
      this.googleToken = event.token;
      SocialNetworkComponent.googleConnected = true;
    }
  }

  @Input('appleData') set getApple(event) {
    if (event && event.id) {
      this.appleId = event.id;
      this.appleToken = event.token;
      this.appleConnected = true;
    }
  }

  @Input()
  public isEditable: boolean;

  constructor(private socialService: SocialLoginService,
              private userService: UserService,
              private _cookieService: CookieService,
              private _ngZone: NgZone,
              private _subject: SubjectsInteractionsService,
              private _dialog: MatDialog,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.translate.get(['disconnect_account_title', 'disconnect_account_description', 'set_password'])
      .subscribe((translated: any) => {
        this.deleteEventTexts = {
          header: translated.disconnect_account_title,
          description: translated.disconnect_account_description,
          button: translated.set_password,
        };
      });

    this.socialService.fbInit();
    this._googleInit();
    this.appleInit();
    const userType = JSON.parse(localStorage.getItem('user_data'));
    this.userPassword = userType.userPassword;
  }

  public submitFacebookLogin(isconnected: boolean): void {
    if (!isconnected) {
      this.socialService.fbLogin().subscribe((user: SocialUser) => {
        this.userService.connectSocial(
          {
            facebookToken: user.facebookToken,
            facebookId: user.facebookId
          }, 'facebook-connect').subscribe((data) => {
          this._cookieService.put('user_id', data.data._id);
          this._cookieService.put('user_token', data.data.token);
          this.fbId = user.facebookId;
          this._ngZone.run(() => {
            this.fbConnected = true;
          });
        });
      });
    } else {
      if (this.userPassword) {
        this.userService.disconnectSocial(
          {
            facebookId: this.fbId,
            facebookToken: this.fbToken
          }, 'facebook-disconnect')
          .subscribe(data => {
            this._ngZone.run(() => {
              this.fbConnected = false;
            });
            this.fbId = '';
            this._cookieService.put('user_id', data.data._id);
            this._cookieService.put('user_token', data.data.token);
          });
      } else {
        this.disconnectModal('Facebook');
      }
    }
  }

  public disconnectModal(social): void {
    const dialogConfig = new MatDialogConfig();
    this.deleteEventTexts.social = social;
    dialogConfig.data = {deleteTexts: this.deleteEventTexts, type: 'disconnect'};
    const dialogRef = this._dialog.open(DeleteComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((id) => {
    });
  }

  public disconnectGoogle() {
    if (this.userPassword) {
      this.userService.disconnectSocial(
        {
          googleId: this.googleId,
          googleToken: this.googleToken
        }, 'google-disconnect')
        .subscribe(data => {
          this._cookieService.put('user_id', data.data._id);
          this._cookieService.put('user_token', data.data.token);
          this.googleId = '';
          this._ngZone.run(() => {
            SocialNetworkComponent.googleConnected = false;
          });

        });
    } else {
      this.disconnectModal('Google');
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

      this._attachSignin(document.getElementById('googleConnect'));
    });
  }

  private appleInit() {
    AppleID.auth.init({
      clientId: 'web.jogoto.com',
      scope: 'name email',
      redirectURI: 'https://jogoto.com/auth/login',
      usePopup: true
    });
  }

  public async submitAppleConnect(isConnected) {
    if (!isConnected) {
      try {
        const data = await AppleID.auth.signIn();
        const user: any = {};
        if(data.user){
          user.name = data.user.name.firstName;
          user.surname = data.user.name.lastName;
          user.email = data.user.email || '';
        }
        if(data.authorization){
          user.appleId = data.authorization.code;
          user.appleToken = data.authorization.id_token;
        }
        this.userService.connectSocial(
          {
            appleToken: user.appleToken ,
            appleId: user.appleId
          }, 'facebook-connect').subscribe((data) => {
          this._cookieService.put('user_id', data.data._id);
          this._cookieService.put('user_token', data.data.token);
          this.appleId = user.appleId;
          this._ngZone.run(() => {
            this.appleConnected = true;
          });
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      if (this.userPassword) {
        this.userService.disconnectSocial(
          {
            appleId: this.appleId,
            appleToken: this.appleToken
          }, 'apple-disconnect')
          .subscribe(data => {
            this._ngZone.run(() => {
              this.appleConnected = false;
            });
            this.appleId = '';
            this._cookieService.put('user_id', data.data._id);
            this._cookieService.put('user_token', data.data.token);
          });
      } else {
        this.disconnectModal('Apple');
      }
    }
  }

  private _attachSignin(element): void {
    this.auth2.attachClickHandler(element, {},
      (googleUser) => {
        const gUser = googleUser.getBasicProfile();
        this.userService.connectSocial(
          {
            googleToken: googleUser.getAuthResponse().id_token,
            googleId: gUser.getId(),
          }, 'google-connect').subscribe((data) => {
          this._cookieService.put('user_id', data.data._id);
          this._cookieService.put('user_token', data.data.token);
          this.googleId = gUser.getId();
          this._ngZone.run(() => {
            SocialNetworkComponent.googleConnected = true;
          });
        });
      });
  }

  get checkGoogle() {
    return SocialNetworkComponent.googleConnected;
  }
}
