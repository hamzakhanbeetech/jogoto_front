import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FollowersFollowingRoutingModule} from './followers-following-routing.module';
import {FollowersFollowingView} from './followers-following.view';
import {SharedModule} from '../../../../shared/shared.module';
import {SearchService} from '../../search/search.service';
import {UserService} from '../../../../services';
import {TabsModule} from 'ngx-bootstrap';

@NgModule({
  declarations: [FollowersFollowingView],
  imports: [
    CommonModule,
    SharedModule,
    TabsModule.forRoot(),
    FollowersFollowingRoutingModule,
  ],
  providers: [
    SearchService,
    UserService,
  ]
})
export class FollowersFollowingModule {
}
