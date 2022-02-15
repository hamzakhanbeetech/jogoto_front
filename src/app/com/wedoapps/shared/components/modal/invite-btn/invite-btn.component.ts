import {Component, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {IviteModalComponent} from '../ivite-modal/ivite-modal.component';
import {InviteByEmailComponent} from '../invite-by-email/invite-by-email.component';
import {Router} from '@angular/router';
import {AppService} from '../../../../../../app.service';
import {UserModel} from '../../../../models';
import {ImportFileComponent} from '../import-file/import-file.component';
import {UsersFileModel} from '../../../../views/main/basic/create-group/create-group.models';
import {takeUntil} from 'rxjs/operators';
import {UtilitesService} from "../../../../services";

@Component({
  selector: 'app-invite-btn',
  templateUrl: './invite-btn.component.html',
  styleUrls: ['./invite-btn.component.scss']
})
export class InviteBtnComponent implements OnInit {

  public isAuthorized: boolean;
  @Input('evenId')
  public evenId: string;
  @Input('showInviteButton')
  public showInviteButton: string;
  @Input()
  public organization: UserModel;
  @Input()
  public changePosition: boolean;
  @Input()
  public showFileUpload: boolean = false;

  constructor(private _dialog: MatDialog,
              private _route: Router,
              private _appService: AppService,
              private utilitesService: UtilitesService
  ) {
    this.isAuthorized = this._appService.getIsAuthorized();
  }

  ngOnInit() {
  }

  public onClickInviteButton() {
    if (!this.isAuthorized) {
      const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
      this._route.navigate([localisedUrl]);
    }
  }

  public openInviteMembersModal(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.data.id = this.evenId;

    if (this.organization) {
      dialogConfig.data.organization = this.organization;
    }

    let dialogRef = this._dialog.open(IviteModalComponent, dialogConfig);
  }

  public openInviteMembersByEmailModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {};
    dialogConfig.data.id = this.evenId;

    if (this.organization) {
      dialogConfig.data.organization = this.organization;
    }

    let dialogRef = this._dialog.open(InviteByEmailComponent, dialogConfig);
  }

    public openDialogFileUpload(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {};
        dialogConfig.data.type = 'event';
        dialogConfig.data.id = this.evenId;
        const dialogRef = this._dialog.open(ImportFileComponent, dialogConfig);
    }
}
