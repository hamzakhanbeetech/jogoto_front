import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RecoveryPasswordView} from './recovery-password.view';
import {RecoveryPasswordRoutingModule} from './recovery-password-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RecoveryPasswordService} from './recovery-password.service';
import {SharedModule} from '../../../../shared/shared.module';
import {TransformErrorService} from '../../../../services';


@NgModule({
  declarations: [
    RecoveryPasswordView,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    RecoveryPasswordRoutingModule,
    SharedModule
  ],
  providers: [RecoveryPasswordService,
    TransformErrorService]
})
export class RecoveryPasswordModule {
}
