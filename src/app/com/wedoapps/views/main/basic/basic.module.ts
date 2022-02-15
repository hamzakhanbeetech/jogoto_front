import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BsDropdownModule} from 'ngx-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CreateEventService} from './create-event/create-event.service';
import {SharedModule} from '../../../shared/shared.module';
import {BasicRoutingModule} from './basic.routing.module';
import {BasicService} from './basic.service';
import {BasicView} from './basic.view';

@NgModule({
  declarations: [
    BasicView
  ],
  imports: [
    BsDropdownModule,
    TranslateModule,
    BasicRoutingModule,
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule
  ],
  providers: [
    BasicService,
    CreateEventService
  ]
})
export class BasicModule {
}
