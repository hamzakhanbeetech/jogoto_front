import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {UsersFileModel} from '../../../../views/main/basic/create-group/create-group.models';
import {SubjectsInteractionsService} from '../../../../services';
import {GroupService} from '../../../../views/main/group/group.service';
import {SendInfoToAlertMessage} from '../../../../models';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-import-file',
  templateUrl: './import-file.component.html',
  styleUrls: ['./import-file.component.scss']
})
export class ImportFileComponent implements OnInit {
  public typeError: boolean;
  public alertData: SendInfoToAlertMessage = {} as SendInfoToAlertMessage;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private _subjectService: SubjectsInteractionsService,
              private _groupService: GroupService,
              public _translate: TranslateService,
              private _dialog: MatDialog) {
  }

  ngOnInit() {
  }

  public getFile(file: UsersFileModel): void {
    this.typeError = file.error;
    if (!this.typeError) {
      if (this.data.type === 'event') {
        this.sendFile(file);
      } else {
        this._subjectService.uploadedFile.next(file);
      }
    }
  }

  private sendFile(file) {
    this._groupService.sendFile(this.data.id, file, 'event')
      .subscribe((value) => {
        this._dialog.closeAll();
        this.alertData.type = 'success';
        this._translate.get('invitations_success').subscribe(translate => {
          this.alertData.messageText = translate;
        });
        this.alertData.display = true;
        this._subjectService.errorSuccessMessag.next(this.alertData);
      }, err => {
        console.log(err);
      });
  }

  public checkErr(err): void {
    this.typeError = err;
  }
}
