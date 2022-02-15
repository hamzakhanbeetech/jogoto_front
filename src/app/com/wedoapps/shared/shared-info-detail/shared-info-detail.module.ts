import {NgModule} from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule} from 'ngx-bootstrap';
import {CommonModule} from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {PagesCategoriesComponent} from './components/pages-categories/pages-categories.component';
import {LastFollowersComponent} from './components/last-followers/last-followers.component';
import {SocialNetworkComponent} from './components/social-network/social-network.component';
import {UserImageComponent} from './components/user-image/user-image.component';
import {SharedModule} from '../shared.module';
import {LargeNumbersPipe} from '../../pipes';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    LargeNumbersPipe,
    UserImageComponent,
    LastFollowersComponent,
    SocialNetworkComponent,
    PagesCategoriesComponent,
  ],
  imports: [
    NgbModule,
    RouterModule,
    SharedModule,
    CommonModule,
    MatRadioModule,
    TranslateModule,
    TabsModule.forRoot(),
    BsDropdownModule
  ],
  exports: [
    LargeNumbersPipe,
    UserImageComponent,
    LastFollowersComponent,
    SocialNetworkComponent,
    PagesCategoriesComponent,
  ],
})
export class SharedInfoDetailModule {
}
