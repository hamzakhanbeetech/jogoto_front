import {TranslateService} from '@ngx-translate/core';
import {Component, Input, OnInit} from '@angular/core';

import {MatModalComponent} from '../../../components/mat-modal/mat-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {UserModel} from '../../../../models/global.models';
import {SubjectsInteractionsService} from '../../../../services';

@Component({
  selector: 'app-pages-categories',
  templateUrl: './pages-categories.component.html',
  styleUrls: ['./pages-categories.component.scss']
})
export class PagesCategoriesComponent implements OnInit {
  @Input()
  public user: UserModel;
  @Input()
  public isFollowerPage: boolean;
  public categories = this.translate.instant('filter.categories');
  public data;
  public isOk: boolean = false;
  constructor(private translate: TranslateService,
              private _subjectsInteractionsService: SubjectsInteractionsService,
              private _dialog: MatDialog) {
  }

  ngOnInit() {
  }

  public openDialog(name: string, title): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {name, title};
    const dialogRef = this._dialog.open(MatModalComponent, dialogConfig);
  }

    public openChanged(ev){
       this.data = {isClosed:ev, isOk:this.isOk};
    }
}
