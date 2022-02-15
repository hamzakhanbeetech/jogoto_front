import { NgModule } from '@angular/core';
import {TabsModule} from 'ngx-bootstrap';
import {CommonModule} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import { EventsRoutingModule } from './events-routing.module';
import { EventsView } from './events.view';
import {SharedModule} from '../../../../shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {InitialService} from '../../initial/initial.service';
import {EventsService} from './events.service';

@NgModule({
  declarations: [EventsView],
  imports: [
    CommonModule,
    EventsRoutingModule,
    TabsModule.forRoot(),
    SharedModule,
    TranslateModule,
    DropdownModule
  ],
  providers: [
    InitialService,
    EventsService
  ],
})
export class EventsModule { }
