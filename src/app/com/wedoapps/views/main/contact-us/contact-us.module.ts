import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContactUsView} from './contact-us.view';
import {ContactUsRoutingModule} from './contact-us.routing.module';
import {ContactUsService} from './contact-us.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../shared/shared.module';
import {SearchService} from '../search/search.service';

@NgModule({
  declarations: [ContactUsView],
  imports: [
    ContactUsRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule],
  providers: [ContactUsService, SearchService]
})
export class ContactUsModule {
}
