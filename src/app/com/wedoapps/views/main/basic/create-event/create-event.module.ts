import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BsDropdownModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/primeng';

import { CreateEventService } from './create-event.service';
import { CreateEventRoutingModule } from './create-event-routing.module';
import { CreateEventView } from './create-event.view';
import { DublicateEventModalComponent } from './components/dublicate-event-modal/dublicate-event-modal.component';
import { SharedModule } from '../../../../shared/shared.module';
import { FiltersService } from '../../../../services';



@NgModule({
  declarations: [
    CreateEventView,
    DublicateEventModalComponent
  ],
  imports: [
    CommonModule,
    CreateEventRoutingModule,
    TranslateModule,
    MatDialogModule,
    BsDropdownModule.forRoot(),
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
  ],
  entryComponents: [
    DublicateEventModalComponent
  ],
  providers: [
    CreateEventService,
    FiltersService
  ]
})
export class CreateEventModule {
}
