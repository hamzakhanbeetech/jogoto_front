import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AboutOrganizerRoutingModule} from './about-organizer-routing.module';
import {AboutOrganizerComponent} from './about-organizer.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../../shared/shared.module';

@NgModule({
  declarations: [AboutOrganizerComponent],
  imports: [
    CommonModule,
    AboutOrganizerRoutingModule,
    TranslateModule,
    SharedModule,
  ]
})
export class AboutOrganizerModule {
}
