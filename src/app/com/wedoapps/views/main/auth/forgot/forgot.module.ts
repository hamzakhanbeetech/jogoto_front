import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ForgotView} from './forgot.view';
import {ForgotRoutingModule} from './forgot.routing.module';
import {ForgotService} from './forgot.service';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';


@NgModule({
  declarations: [ForgotView],
  imports: [
    ForgotRoutingModule,
    TranslateModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule],
  providers: [ForgotService]
})
export class ForgotModule {
}
