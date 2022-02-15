import { Component, Inject, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EventService } from '../../../../views/main/event/event.service';
import { ServerResponse } from '../../../../models/global.models';
import { SubjectsInteractionsService } from '../../../../services/subjects-interactions.service';


@Component({
    selector: 'app-notification-settings-modal',
    templateUrl: './notification-settings-modal.component.html',
    styleUrls: ['./notification-settings-modal.component.scss'],
})
export class NotificationSettingsModalComponent implements OnInit, OnDestroy {
  public _notificationForm: FormGroup;
  public notificationText: string;
  public isGroup: boolean;
  private _notificationSubscription: Subscription = new Subscription();
  constructor(private _subjectsInteractionsService: SubjectsInteractionsService,
              public dialogRef: MatDialogRef<NotificationSettingsModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _fb: FormBuilder,
              private _eventService: EventService) { }

  ngOnInit() {
    this.isGroup = this.data.isGroup;
    this._formBuilder()

  }

  private _formBuilder() {
    if(this.isGroup){
        this._notificationForm = this._fb.group({
            notificationSetting: [this.data.groupData, Validators.required]
        });
    }else{
        this._notificationForm = this._fb.group({
            notificationSetting: [this.data.eventData.notify, Validators.required]
        })
    }
  }

  public clickToSaveButton(): void {
      if(this.isGroup){
          this._notificationSubscription = this._eventService.setGroupNotificationSettings(this.data.groupId, this._notificationForm.get('notificationSetting').value).subscribe((data: ServerResponse<{}>) => {
              this.dialogRef.close(this._notificationForm.get('notificationSetting').value)
          })
      }else{
          this._notificationSubscription = this._eventService.notificationSettings(this.data.eventData._id, this._notificationForm.get('notificationSetting').value).subscribe((data: ServerResponse<{}>) => {
              this.dialogRef.close(this._notificationForm.get('notificationSetting').value)
          })
      }
  }

  get notificationForm(): FormGroup {
    return this._notificationForm
  }

  ngOnDestroy() {
    this._notificationSubscription.unsubscribe()
  }

}
