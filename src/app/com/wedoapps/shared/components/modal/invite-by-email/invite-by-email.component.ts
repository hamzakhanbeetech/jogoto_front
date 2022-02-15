import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CookieService} from 'ngx-cookie';

import {ServerResponse, EventModel, UserModel} from '../../../../models/global.models';
import {EventService} from '../../../../views/main/event/event.service';
import {ValidatorHelper} from '../../../../helpers/validator.helper';
import {UserService} from '../../../../services';

@Component({
  selector: 'app-invite-by-email',
  templateUrl: './invite-by-email.component.html',
  styleUrls: ['./invite-by-email.component.scss']
})
export class InviteByEmailComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  public errorMessage: string = undefined;
  public invitedEmailsList: Array<string> = [];
  public organization: UserModel;

  private _inviteByEmailForm: FormGroup;
  private _emailPattern = ValidatorHelper.EMAIL_REGEXP;

  constructor(public dialogRef: MatDialogRef<InviteByEmailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _fb: FormBuilder,
              private _userService: UserService,
              private _eventService: EventService,
              private _cookieService: CookieService) {
  }

  ngOnInit() {
    this._formBuilder();

    if (this.data.organization) {
      this.organization = this.data.organization;
    }

  }

  public inviteByEmails(): void {
    this.loading = true;
    const userId = this._cookieService.get('user_id');

    this._eventService.inviteByEmailAddresses(userId, this.data, this.invitedEmailsList)
      .subscribe(() => {
        this.responseHandler();
      }, err => {
        this.errorMessage = err.error.error.message;
        this.loading = false;

      });
  }

  public addEmailToListOfInvition(): void {
    this.invitedEmailsList.push(this._inviteByEmailForm.value.email.replace(/ /g, ''));

    this._inviteByEmailForm.get('email').setValue('');
  }

  public deleteAddressFromList(index): void {
    this.invitedEmailsList.splice(index, 1);
  }

  public inviteByEmailForOrganization(): void {
    this.loading = true;
    const userId = this._cookieService.get('user_id'),
      body = {
        page_id: this.organization._id,
        emails: this.invitedEmailsList
      };
      this._userService.sendInvitationByEmail(body)
      .subscribe(() => {
        this.responseHandler();
      }, err => {
        this.errorMessage = err.error.error.message;
        this.loading = false;
      });

  }

  private responseHandler(): void {
    this.loading = false;
    this.dialogRef.close(true);
  }

  private _formBuilder(): void {
    this._inviteByEmailForm = this._fb.group({
      email: new FormControl('', [Validators.required, Validators.pattern(this._emailPattern)])
    });
  }

  get inviteByEmail() {
    return this._inviteByEmailForm;
  }

  ngOnDestroy() {
  }


}
