import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginView} from './login.view';
import {LoginRoutingModule} from './login.routing.module';
import {LoginService} from './login.service';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CheckEmailComponent} from './components';
import {SharedModule} from '../../../../shared/shared.module';
import {TransformErrorService} from '../../../../services';
import {SocialLoginModule} from '../social-login/social-login.module';

@NgModule({
  declarations: [LoginView,
    CheckEmailComponent,
  ],
  imports: [
    LoginRoutingModule,
    TranslateModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
  ],
  providers: [LoginService,
    TransformErrorService]
})
export class LoginModule {
}
