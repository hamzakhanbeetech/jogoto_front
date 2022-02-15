import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {AuthRoutingModule} from './auth.routing.module';
import {AuthView} from './auth.view';
import {AuthService} from './auth.service';
import {SharedModule} from '../../../shared/shared.module';
import {BsDropdownModule} from 'ngx-bootstrap';
import {MergeAccountsGuard} from '../../../guards/merge-accounts.guard';

@NgModule({
  declarations: [
    AuthView,
  ],
  imports: [
    AuthRoutingModule,
    TranslateModule,
    SharedModule,
    BsDropdownModule.forRoot(),
    SharedModule,
  ],
  providers: [AuthService, MergeAccountsGuard]
})
export class AuthModule {
}
