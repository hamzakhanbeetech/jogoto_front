import {NgModule} from '@angular/core';
import {GroupView} from './group.view';
import {GroupRoutingModule} from './group.routing.module';
import {GroupService} from './group.service';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {TranslateModule} from '@ngx-translate/core';
import {BsDropdownModule} from 'ngx-bootstrap';
import {InitialService} from '../initial/initial.service';
import {SharedModule} from '../../../shared/shared.module';
import {CommonModule} from '@angular/common';
import {EventService} from '../event/event.service';
import {TransformErrorService} from '../../../services';

@NgModule({
  declarations: [
    GroupView
  ],
  imports: [
    CommonModule,
    GroupRoutingModule,
    TabsModule.forRoot(),
    TranslateModule,
    SharedModule,
    BsDropdownModule.forRoot()
  ],
  providers: [
    GroupService,
    InitialService,
    EventService,
    TransformErrorService
  ]
})
export class GroupModule {
}
