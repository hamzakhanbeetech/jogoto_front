import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PrivancyPolicyRoutingModule} from './privancy-policy-routing.module';
import {PrivancyPolicyComponent} from './privancy-policy.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  declarations: [PrivancyPolicyComponent],
  imports: [
    CommonModule,
    PrivancyPolicyRoutingModule,
    TranslateModule,
    SharedModule
  ]
})

export class PrivancyPolicyModule {
}
