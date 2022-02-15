import {NgModule} from '@angular/core';
import {EmailVerificationView} from './email-verification.view';
import {EmailVerificationRoutingModule} from './email-verification-routing.module';
import {EmailVerificationService} from './email-verification.service';
import {SharedModule} from '../../../../shared/shared.module';
import {TransformErrorService} from '../../../../services';

@NgModule({
  declarations: [EmailVerificationView],
  imports: [EmailVerificationRoutingModule, SharedModule],
  providers: [EmailVerificationService, TransformErrorService]
})
export class EmailVerificationModule {
}
