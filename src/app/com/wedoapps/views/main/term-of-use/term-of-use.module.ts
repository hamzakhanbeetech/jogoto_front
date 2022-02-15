import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TermOfUseRoutingModule} from './term-of-use-routing.module';
import {TermOfUseComponent} from './term-of-use.component';
import {TranslateModule} from '@ngx-translate/core';
import {TabsModule} from 'ngx-bootstrap';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  declarations: [TermOfUseComponent],
  imports: [
    CommonModule,
    TermOfUseRoutingModule,
    TranslateModule,
    TabsModule.forRoot(),
    SharedModule
  ]
})

export class TermOfUseModule {
}
