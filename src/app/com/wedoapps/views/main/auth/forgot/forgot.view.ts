import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ForgotService} from './forgot.service';
import {ServerResponse, SendInfoToAlertMessage} from '../../../../models/global.models';
import {SendingDatasForForgot} from './forgot.models';
import {ValidatorHelper} from '../../../../helpers/validator.helper';
import {SubjectsInteractionsService} from '../../../../services';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.view.html',
  styleUrls: ['./forgot.view.scss']
})
export class ForgotView implements OnInit, OnDestroy {
  public loading: boolean = false;
  public serverError: string = undefined;
  private _forgotForm: FormGroup;
  private _hash: string;
  public success: boolean = false;
  private _subscription: Subscription = new Subscription();
  private _resendSubscription: Subscription = new Subscription();
  private _emailPattern = ValidatorHelper.EMAIL_REGEXP;

  public sendingInfo: SendInfoToAlertMessage = {display: true} as SendInfoToAlertMessage;

  constructor(private _router: Router, private _fb: FormBuilder,
              private _forgotService: ForgotService, private _route: ActivatedRoute,
              private _translateService:TranslateService,
              private _subjectsIteractionsService: SubjectsInteractionsService) {
  }

  ngOnInit() {
    this._formBuilder();
    this._checkVerification();

  }

  private _checkVerification(): void {
    this._route.queryParams.subscribe((data) => {
      if (data.errorText && data.success) {
        window.scrollTo(0, 0);
        this.sendingInfo = {type: 'error', messageText: data.errorText, display: true};
        this._subjectsIteractionsService.errorSuccessMessag.next(this.sendingInfo);
        this.success = data.success;
      }
    });
  }

  private _formBuilder(): void {
    this._forgotForm = this._fb.group({
      email: new FormControl('', [Validators.required, Validators.pattern(this._emailPattern)])
    });
  }

  public isFormValid(controlName: string): boolean {
    return this._forgotForm.get(controlName).invalid && this._forgotForm.get(controlName).touched;
  }

  public forgotPassword(): void {
    if (this._forgotForm.valid) {
      window.scrollTo(0, 0);
      this.loading = true;
      let sendingData: SendingDatasForForgot = {
          email: this._forgotForm.value.email.replace(/ /g, ''),
          lang: this._translateService.currentLang
      };
      this._subscription = this._forgotService.forgotPassword(sendingData)
        .subscribe((response: ServerResponse<{}>) => {
          this.loading = false;
          this.success = true;
          this.serverError = null;
          this.sendingInfo.type = 'success';
          this.sendingInfo.messageText = `${this._translateService.instant('login.forgot_mess')} ${this._forgotForm.get('email').value.replace(/ /g, '')}`;
          this._subjectsIteractionsService.errorSuccessMessag.next(this.sendingInfo);
        }, err => {
          if (err.show) {
            this.serverError = err.messageText;
          } else if (err.error) {
            this.serverError = err.error.error.message;
          }
          this.loading = false;
        });
    }
  }

  public onClickResendCode(): void {
    window.scrollTo(0, 0);
    this.loading = true;
    let sendingData: SendingDatasForForgot = {
      email: this._forgotForm.value.email.replace(/ /g, '')
    };
    this._resendSubscription = this._forgotService.resendPassword(sendingData)
      .subscribe((response: ServerResponse<{}>) => {
        this.loading = false;
        this.success = true;
        this.sendingInfo.type = 'success';
        this.serverError = null;
        this.sendingInfo.messageText = `${this._translateService.instant('login.forgot_mess')} ${this._forgotForm.get('email').value.replace(/ /g, '')}`;
        this._subjectsIteractionsService.errorSuccessMessag.next(this.sendingInfo);
      }, err => {
        if (err.error) {
          this.serverError = err.error.error.message;
        } else if (err.show) {
          this.serverError = err.messageText;
        } else {
          return err;
        }
        this.loading = false;
      });
  }

  get forgotForm(): FormGroup {
    return this._forgotForm;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this._resendSubscription.unsubscribe();
  }


}
