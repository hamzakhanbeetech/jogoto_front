import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {DeleteService, UtilitesService} from '../../../../services';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie';
import {Location} from '@angular/common';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
})
export class DeleteComponent implements OnInit {
  public texts: any;
  public loading: boolean = false;
  public errorText: string;
  private userId = this._cookieService.get('user_id');
  private redirectEvent = `basic/events/${this.userId}`;
  private redirectGroup = `basic/groups/${this.userId}`;
  private redirectSetting = `basic/settings`;

  constructor(public dialogRef: MatDialogRef<DeleteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _deleteService: DeleteService,
              private _router: Router,
              private _translate: TranslateService,
              private _dialog: MatDialog,
              private _location: Location,
              private _cookieService: CookieService,
              private utilitesService: UtilitesService
  ) {
  }

  ngOnInit() {
    this.texts = this.dialogRef.componentInstance.data.deleteTexts;
  }

  public delete(): void {
    this.loading = true;

    if (this.dialogRef.componentInstance.data.type === 'disconnect') {
      this._dialog.closeAll();
      const localisedUrl = this.utilitesService.localizeRouter(this.redirectSetting);
      this._router.navigate([localisedUrl]);
    }else if(this.dialogRef.componentInstance.data.type.startsWith('block')){
        this._deleteService.blockApi(this.dialogRef.componentInstance.data.id,
            this.dialogRef.componentInstance.data.type,
            this.dialogRef.componentInstance.data.eventId || null,
            this.dialogRef.componentInstance.data.u_id)
            .subscribe(data => {
                history.go(- 1)
            })
    } else {
      this._deleteService.deleteAip(this.dialogRef.componentInstance.data.id,
        this.dialogRef.componentInstance.data.type,
        this.dialogRef.componentInstance.data.eventId || null,
        this.dialogRef.componentInstance.data.u_id)
        .subscribe(data => {
          if (this.dialogRef.componentInstance.data.type !== 'group' && this.dialogRef.componentInstance.data.type !== 'groupEvent' && this.dialogRef.componentInstance.data.type !== 'events/remove' && this.dialogRef.componentInstance.data.type !== 'group/remove') {
            this._dialog.closeAll();
            const localisedUrl = this.utilitesService.localizeRouter(this.redirectEvent);
            this._router.navigate([localisedUrl], {queryParams: {type: 'archived'}});
          } else if (this.dialogRef.componentInstance.data.type === 'group') {
            this._dialog.closeAll();
            const localisedUrl = this.utilitesService.localizeRouter(this.redirectGroup);
            this._router.navigate([localisedUrl], {queryParams: {type: 'archive'}});
          } else {
            this.dialogRef.close(this.dialogRef.componentInstance.data.eventId);
          }
          this.loading = false;
        }, err => {
          this._translate.get('delete_error').subscribe((translated: any) => {
            this.errorText = translated;
          });
          this.loading = false;
        });
    }


  }
  public closeDialog() {
    try {
      this.dialogRef.close(); // make sure it only closes if the upper async fn succesfully ran!
    } catch(e) {
    }
}
}
