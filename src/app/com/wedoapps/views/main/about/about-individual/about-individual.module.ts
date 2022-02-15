import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AboutIndividualRoutingModule} from './about-individual-routing.module';
import {AboutIndividualComponent} from './about-individual.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../../shared/shared.module';

@NgModule({
  declarations: [AboutIndividualComponent],
  imports: [
    CommonModule,
    AboutIndividualRoutingModule,
    TranslateModule,
    SharedModule
  ]
})
export class AboutIndividualModule {
}
