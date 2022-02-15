import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MergeAccountsRoutingModule } from './merge-accounts-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../../shared/shared.module';
import {MargingAccountsComponent} from './components/root/marging-accounts.component';
import {ComplateInformationComponent} from './components/complate-information/complate-information.component';

@NgModule({
  declarations: [
      MargingAccountsComponent,
      ComplateInformationComponent
  ],
  imports: [
    CommonModule,
    MergeAccountsRoutingModule,
      TranslateModule,
      CommonModule,
      SharedModule,
      FormsModule,
      ReactiveFormsModule,
  ]
})
export class MergeAccountsModule { }
