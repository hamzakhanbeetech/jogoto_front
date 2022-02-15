import {Component, Inject, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {EventService} from '../../../views/main/event/event.service';
import {Subscription} from 'rxjs';
import {ServerResponse, EventModel} from '../../../models/global.models';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-give-feedback-modal',
  templateUrl: './give-feedback-modal.component.html',
  styleUrls: ['./give-feedback-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GiveFeedbackModalComponent implements OnInit, OnDestroy {
  public otherReason: boolean = false;
  public loading: boolean = false;
  private _feedBackForm: FormGroup;
  public textValue: string = '';
  private _unJoinEventSubscription: Subscription = new Subscription();
  public reasonsList: Array<string> = [];

  constructor(public dialogRef: MatDialogRef<GiveFeedbackModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _fb: FormBuilder,
              private _eventService: EventService,
              private _translate: TranslateService) {
  }

  ngOnInit() {
    this._translate.get(['notInterested.decidedToStayHome',
      'notInterested.notMyTaste',
      'notInterested.haveSomethingElsePlanned',
      'notInterested.notEnoughFriendsGoing',
      'notInterested.locationTooFar',
      'notInterested.other']).subscribe((translated: any) => {
      for (const key in translated) {
        this.reasonsList.push(translated[key]);
      }
    });
    this._formBuilder();
  }


  private _formBuilder(): void {
    this._feedBackForm = this._fb.group({
      reasonForForm: [''],
      otherReasonText: ['']
    });

    this._feedBackForm.get('reasonForForm').valueChanges.subscribe((data) => {
      data === 'Other' || data === 'Autre' ? this.otherReason = true : this.otherReason = false;
    });
  }

  get feedBackForm(): FormGroup {
    return this._feedBackForm;
  }

  public unJoinToEvent() {
    let reasonTextValue = '';
    if (this._feedBackForm.get('reasonForForm').value === 'Other' || this._feedBackForm.get('reasonForForm').value === 'Autre') {
      reasonTextValue = this._feedBackForm.get('otherReasonText').value;
    } else {
      reasonTextValue = this._feedBackForm.get('reasonForForm').value;
    }
    this.loading = true;
    this._feedBackForm.disable();
    this._unJoinEventSubscription = this._eventService.unJoinToEvent(this.data, reasonTextValue).subscribe((data: ServerResponse<EventModel>) => {
      this.loading = false;
      this._feedBackForm.enable();
      this.dialogRef.close(data);
    }, (err) => {
    });
  }

  public forDisableOrNot(): boolean {
    let isValid;
    if (!this._feedBackForm.get('reasonForForm').value) {
      isValid = true;
    } else if (this._feedBackForm.get('reasonForForm').value && this._feedBackForm.get('reasonForForm').value !== 'Other' && this._feedBackForm.get('reasonForForm').value !== 'Autre') {
      isValid = false;
    } else if (this._feedBackForm.get('reasonForForm').value && this._feedBackForm.get('reasonForForm').value === 'Other' && this._feedBackForm.get('reasonForForm').value === 'Autre') {
      this._feedBackForm.get('otherReasonText').value === '' ? isValid = true : isValid = false;
    }
    return isValid;
  }

  ngOnDestroy() {
    this._unJoinEventSubscription.unsubscribe();
  }
}
