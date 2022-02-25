import {TranslateService} from '@ngx-translate/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {MatModalComponent} from '../../../../../shared/components/mat-modal/mat-modal.component';
import { IviteModalComponent } from 'src/app/com/wedoapps/shared/components/modal/ivite-modal/ivite-modal.component';
import { GetEmailModalComponent } from 'src/app/com/wedoapps/shared/components/modal/get-email-modal/get-email-modal.component';
import { SubjectsInteractionsService } from 'src/app/com/wedoapps/services';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public title = {
    'dropdownFilter': this.translate.instant('filter.event_filters'),
    'dropdownWhen': this.translate.instant('filter.date_filters'),
    'dropdownWhere': this.translate.instant('filter.choose_location'),
    'dropdownCats': this.translate.instant('filter.categories'),
  };

  @Input()
  public saveState = false;

  @Output()
  public resetData: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  public exportEvents: EventEmitter<void> = new EventEmitter<void>();

  constructor(private translate: TranslateService,
              private _dialog: MatDialog,) {
  }

  ngOnInit() {
  }

  public openDialog(name: string, title): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {name, title, saveState:true};
    let dialogRef = this._dialog.open(MatModalComponent, dialogConfig);
  }

  public resetFilterData(): void {
    this.resetData.emit();
  }

  public exportEventsToGoogleCalendar(){
    this.exportEvents.emit()
  }
}
