import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ResendPasswordView} from './resend-password.view';
import {ResendPasswordRoutingModule} from './resend-password-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from "../../../../shared/shared.module";

@NgModule({
  declarations: [ResendPasswordView],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        ResendPasswordRoutingModule,
        SharedModule
    ]
})
export class ResendPasswordModule {
}
