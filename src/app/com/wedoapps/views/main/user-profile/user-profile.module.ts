import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {DropdownModule} from 'primeng/dropdown';
import {CalendarModule} from 'primeng/calendar';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MatRadioModule} from '@angular/material/radio';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';

import {DashboardProfileComponent} from './components/dashboard-profile/dashboard-profile.component';
import {SharedInfoDetailModule} from '../../../shared/shared-info-detail/shared-info-detail.module';
import {UserProfileRoutingModule} from './user-profile-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import {UserProfileView} from './user-profile.view';
import {TransformErrorService, UserService} from '../../../services';


@NgModule({
  declarations: [
    UserProfileView,
    DashboardProfileComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    SharedInfoDetailModule,
    GooglePlaceModule,
    NgbModule,
    TabsModule.forRoot(),
    MatRadioModule,
    AutoCompleteModule,
    CalendarModule,
    DropdownModule,
    AutocompleteLibModule,
    UserProfileRoutingModule
  ],
  providers: [
    UserService,
    TransformErrorService
  ]
})
export class UserProfileModule {
}
