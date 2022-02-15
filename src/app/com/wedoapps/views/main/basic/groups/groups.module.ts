import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GroupsRoutingModule} from './groups-routing.module';
import {GroupsView} from './groups.view';
import {TranslateModule} from '@ngx-translate/core';
import {TabsModule} from 'ngx-bootstrap';
import {GroupsService} from './groups.service';
import {SharedModule} from '../../../../shared/shared.module';
import {InitialService} from '../../initial/initial.service';

@NgModule({
  declarations: [GroupsView],
  imports: [
    CommonModule,
    GroupsRoutingModule,
    TranslateModule,
    TabsModule.forRoot(),
    SharedModule

  ],
  providers: [
    GroupsService,
    InitialService
  ],
})
export class GroupsModule {
}
