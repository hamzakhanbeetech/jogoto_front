import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie';
import {timer} from 'rxjs';
import {Subscription} from 'rxjs';

import {RecoveryPasswordService} from './recovery-password.service';
import {HashModel, ResetPasswordSendingData} from './recovery-password.models';
import {ServerResponse, UserDataModel, SendInfoToAlertMessage} from '../../../../models/global.models';
import {SubjectsInteractionsService, UtilitesService} from '../../../../services';

@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.view.html',
  styleUrls: ['./recovery-password.view.scss']
})
export class RecoveryPasswordView implements OnInit {
  private _recoveryForm: FormGroup;
  private _hash: string;
  public sendingInfo: SendInfoToAlertMessage;
  public serverError: string = undefined;
  public loading: boolean = false;
  private _savePasswordSubscribe: Subscription = new Subscription();

  constructor(private _router: Router,
              private _fb: FormBuilder,
              private _route: ActivatedRoute,
              private _recoveryPasswordService: RecoveryPasswordService,
              private _cookieService: CookieService,
              private _subjectsIteractionsService: SubjectsInteractionsService,
              private utilitesService: UtilitesService
  ) {
  }

  ngOnInit() {
    this._route.queryParams.subscribe((data: HashModel) => {
      if (data && data.hash) {
        this._hash = data.hash;
        this._recoveryPasswordService.usersResetPassword(this._hash).subscribe((response: ServerResponse<UserDataModel>) => {
          window.scrollTo(0, 0);
          this._cookieService.put('user_id', response.data._id);
          this._cookieService.put('user_token', response.data.token);

        }, (err) => {
          if (err.error) {
            const localisedUrl = this.utilitesService.localizeRouter('/auth/forgot');
            this._router.navigate([localisedUrl], {queryParams: {errorText: err.error.error.message, success: true}});
          }
        });
      }
    });
    this._formBuilder();
  }

  private _formBuilder(): void {
    this._recoveryForm = this._fb.group({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repeatPassword: new FormControl('', [Validators.required])
    }, {validator: this._matchingPasswords('newPassword', 'repeatPassword')});
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

  public checkInputsRightOrNot(inputName): boolean {
    return this._recoveryForm.get(inputName).invalid && this._recoveryForm.get(inputName).touched;
  }

  public onClickSave(): void {
    this.loading = true;
    const sendingData: ResetPasswordSendingData = {
      password: this._recoveryForm.value.newPassword
    };
    this._savePasswordSubscribe = this._recoveryPasswordService.recoverPassword(sendingData).subscribe((data: ServerResponse<UserDataModel>) => {
        this.loading = false;
        this.sendingInfo = {type: 'success', messageText: 'Password changed', display: true};
        this._subjectsIteractionsService.errorSuccessMessag.next(this.sendingInfo);
        timer(2000).subscribe(() => {
          const localisedUrl = this.utilitesService.localizeRouter('auth/login');
          this._router.navigate([localisedUrl]);
        });

      }, (err: any) => {
        if (err.error) {
          this.serverError = err.error.error.message;
        } else if (err.show) {
          this.serverError = err.messageText;
        }
        this.loading = false;
      }
    );
  }

  get recoveryForm(): FormGroup {
    return this._recoveryForm;
  }

  ngOnDestroy() {
    this._savePasswordSubscribe.unsubscribe();
  }

}
