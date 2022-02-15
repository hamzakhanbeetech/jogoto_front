import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {ValidatorHelper} from '../../../../../../helpers/validator.helper';
import {ServerResponse, UserDataModel} from '../../../../../../models';
import {RegistrationService} from '../../../registration/registration.service';
import {UtilitesService} from '../../../../../../services';

@Component({
  selector: 'app-complate-information',
  templateUrl: './complate-information.component.html',
  styleUrls: ['./complate-information.component.scss']
})
export class ComplateInformationComponent implements OnInit {
  @Input() public user: any;
  public loading: boolean = false;
  public servErr: string;
  public email: string;
  private _emailPattern = ValidatorHelper.EMAIL_REGEXP;
  public emailForm: FormControl = new FormControl('',
    [
      Validators.required,
      Validators.pattern(this._emailPattern),
      Validators.maxLength(100)]);
  @Output('email') private _value: EventEmitter<any> = new EventEmitter<any>();

  constructor(private registrationService: RegistrationService,
              private _utilitiesService: UtilitesService) {
  }

  ngOnInit() {
  }

  public completeInfo() {
    let type;
    if (this.user.googleId) {
      type = 'google';
    } else if (this.user.facebookId) {
      type = 'facebook';
    } else {
      type = 'apple'
    }
    this.user.email = this.emailForm.value;
    this.registrationService.signInSocial(this.user, type)
      .subscribe((data: ServerResponse<UserDataModel>) => {
        if (data.info.popup) {
          this.user.name = data.data.name;
          this.user.surname = data.data.surname;
          this.user.imageLink = data.data.poster.min;
          this._value.emit(this.user)
        } else {
          localStorage.removeItem('social_user_data');
          this._utilitiesService._setUserState(data);
        }
      }, err => {
        this.emailForm.markAsPristine();
        this.servErr = err.error.error.message;
        this.loading = false;
      });
  }
}
