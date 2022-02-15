import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SocialUser} from '../views/main/auth/registration/registration.models';

declare const FB: any;

@Injectable({providedIn: 'root'})

export class SocialLoginService {
  private fbAccessToken: string;

  constructor() {
  }

  public fbInit(isLogin = false): Observable<boolean> {
      return Observable.create(observer => {
          if(document.getElementById('facebook-jssdk') && isLogin){
              FB.XFBML.parse();
          }
          (<any>window).fbAsyncInit = () => {
              FB.init({
                  appId: '343186763241967',
                  xfbml: true,
                  version: 'v3.3'
              });
              FB.Event.subscribe('xfbml.render', ()=>{
                  observer.next(true);
                  observer.complete();
                  });
              FB.Event.subscribe('auth.login', ()=>{
                 console.log('login')
              });
          };

          (function (d, s, id) {
              let js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {
                  return;
              }
              js = d.createElement(s);
              js.id = id;
              js.async = true;
              js.src = 'https://connect.facebook.net/en_US/sdk.js';
              fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
      })
  }

  public fbLogin(): Observable<SocialUser> {
    this.checkLoginState();
    return Observable.create(observer => {
      FB.login((response) => {
          this.fbAccessToken = response.authResponse.accessToken;
        if (response.authResponse) {
          FB.api('/me?fields=picture.type(large),id,first_name,last_name,email', (response) => {
              let user = {
              name: response.first_name,
              surname: response.last_name,
              facebookToken: this.fbAccessToken,
              facebookId: response.id,
              imageLink: response.picture.data.url,
              location: null,
              email: response.email
            };
            observer.next(user);
            observer.complete();
          });
        } else {
          observer.complete();
          console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'public_profile,email', return_scopes: true});
    });
  }

  private checkLoginState() {
    FB.getLoginStatus((response) => {
      this.statusChangeCallback(response);
    }, true);
  }

  private statusChangeCallback(response) {
    if (response.status === 'connected') {
      this.fbAccessToken = response.authResponse.accessToken;
    } else if (response.status === 'not_authorized') {
      console.log('not_authorized');
    }
  }

}
