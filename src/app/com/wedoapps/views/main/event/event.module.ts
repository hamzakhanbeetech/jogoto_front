import { NgModule } from '@angular/core';
import { EventView } from './event.view';
import { EventRoutingModule } from './event.routing.module';
import { EventService } from './event.service';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {InitialService} from '../initial/initial.service';
import {TransformErrorService} from '../../../services';
import {GetUserIpService} from '../../../services/get-user-ip.service';

@NgModule({
  declarations: [
    EventView,
  ],
  imports: [
    CommonModule,
    FormsModule,
    EventRoutingModule,
    SharedModule,
    TranslateModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    MatDialogModule],
  providers: [
    EventService,
    InitialService,
    TransformErrorService,
    GetUserIpService,
  ]
})
export class EventModule {
}
