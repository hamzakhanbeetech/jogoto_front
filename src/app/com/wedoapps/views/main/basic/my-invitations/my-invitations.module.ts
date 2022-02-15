import {NgModule} from '@angular/core';

import {MyInvitationsRoutingModule} from './my-invitations.routing.module';
import {SharedModule} from "../../../../shared/shared.module";
import {MyInvitationsView} from './my-invitations.view';
import {UserService} from "../../../../services";
import {CommonModule} from '@angular/common';
import {TabsModule} from 'ngx-bootstrap';

@NgModule({
  declarations: [MyInvitationsView],
  imports: [
    CommonModule,
    MyInvitationsRoutingModule,
    TabsModule.forRoot(),
    SharedModule
  ],
  exports: [],
  providers: [
    UserService,
  ]
})
export class MyInvitationsModule {
}
