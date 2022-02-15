import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {CommonModule} from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {RegistrationRoutingModule} from './registration.routing.module';
import {RegistrationView} from './registration.view';
import {RegistrationService} from './registration.service';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../../shared/shared.module';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CalendarModule} from 'primeng/calendar';
import {TransformErrorService} from '../../../../services';
import {SocialLoginModule} from '../social-login/social-login.module';

@NgModule({
  declarations: [RegistrationView],
  imports: [
    RegistrationRoutingModule,
    ReactiveFormsModule,
    GooglePlaceModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatInputModule,
    SharedModule,
    TranslateModule,
    MatAutocompleteModule,
    NgbModule,
    CalendarModule,
    SocialLoginModule
  ],
  providers: [RegistrationService, MatNativeDateModule, TransformErrorService]
})
export class RegistrationModule {
}
