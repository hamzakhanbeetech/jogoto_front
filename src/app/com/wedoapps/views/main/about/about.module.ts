import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutView} from './about.view';
import {AboutRoutingModule} from './about.routing.module';
import {SharedModule} from '../../../shared/shared.module';


@NgModule({
  declarations: [AboutView],
  imports: [
    AboutRoutingModule,
    CommonModule,
    SharedModule
  ],
  providers: []
})
export class AboutModule {
}
