import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ValidatorHelper} from '../../../helpers/validator.helper';
import {ContactUsService} from './contact-us.service';
import {ContactUsModel, SendInfoToAlertMessage} from '../../../models/global.models';
import {TranslateService} from '@ngx-translate/core';
import {SubjectsInteractionsService} from '../../../services';


@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.view.html',
  styleUrls: ['./contact-us.view.scss']
})

export class ContactUsView implements OnInit {
  public contactForm: any;
  public nameError: boolean = true;
  public nameMaxError: boolean = true;
  public messageError: boolean = true;
  public emailError: boolean = false;
  public emailMaxError: boolean = false;
  public loading: boolean = false;
  public serverError: string;
  private _emailPattern = ValidatorHelper.EMAIL_REGEXP;
  private contactData: ContactUsModel = {
    'name': '',
    'text': '',
    'email': ''
  };
  public alertData: SendInfoToAlertMessage = {
    type: 'success',
    messageText: '',
    display: true
  };

  constructor(private _fb: FormBuilder,
              private _contactUsService: ContactUsService,
              private _translate: TranslateService,
              private _subjectsIteractionsService: SubjectsInteractionsService) {
  }

  ngOnInit() {
    this.contactForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.pattern(this._emailPattern), Validators.minLength(1), Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
    this._translate.get('contact.success_message').subscribe((translated: any) => {
      this.alertData.messageText = translated;
    });
    this._subjectsIteractionsService.pageTags.next({title:`tags.contact_title`, desc:`tags.contact_desc`});
  }

  public checkName() {
    this.nameError = !!this.contactForm.controls.name.value.trim().length;
    this.contactForm.controls.name.value.trim().length > 100 ? this.nameMaxError = false : this.nameMaxError = true;
  }

  public checkMessage() {
    this.messageError = !!this.contactForm.controls.message.value.trim().length;
  }

  public checkEmail(e) {
    if (e.target.value.trim().length > 0) {
      this.emailError = !!this._emailPattern.test(e.target.value);
      e.target.value.length > 100 ? this.emailMaxError = true : this.emailMaxError = false;
    }
  }

  public sendMessage(): void {
    if (this.contactForm.controls.name.value.trim().length && this.contactForm.controls.message.value.trim().length) {
      this.contactData = {
        'name': this.contactForm.controls.name.value,
        'text': this.contactForm.controls.message.value,
        'email': this.contactForm.controls.email.value
      };
    }
    this.loading = true;
    this._contactUsService.sendContactMessages(this.contactData).subscribe(data => {
      this.loading = false;
      this.contactForm.reset();
      window.scrollTo(0, 0);
      this._subjectsIteractionsService.errorSuccessMessag.next(this.alertData);
    }, err => {
      this.loading = false;
      this.serverError = err.error.error.message;
    });
  }
}
