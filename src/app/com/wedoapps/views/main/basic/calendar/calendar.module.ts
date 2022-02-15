import {NgModule} from '@angular/core';
import {CalendarView} from './calendar.view';
import {CalendarRoutingModule} from './calendar.routing.module';
import {CalendarService} from './calendar.service';
import {FullCalendarModule} from '@fullcalendar/angular';
import {SharedModule} from '../../../../shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SidebarComponent} from './sidebar/sidebar.component';
import {TabsModule} from 'ngx-bootstrap';


@NgModule({
  declarations: [
    CalendarView,
    SidebarComponent
  ],
  imports: [
    CalendarRoutingModule,
    FullCalendarModule,
    SharedModule,
    NgbModule,
    TabsModule.forRoot(),
  ],
  providers: [
    CalendarService
  ],
  exports: []
})
export class CalendarModule {
}
