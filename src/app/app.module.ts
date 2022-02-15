import {UserService} from './com/wedoapps/services/user.service';
import {BrowserModule, HAMMER_GESTURE_CONFIG, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ApiService, DataShareService, TransformErrorService} from './com/wedoapps/services';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {CommonModule} from '@angular/common';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {
  GoogleApiService,
  UtilitesService,
  SubjectsInteractionsService
} from './com/wedoapps/services';
import {AuthGuard} from './com/wedoapps/guards/auth.guard';
import {CookieModule, CookieService} from 'ngx-cookie';
import { GestureConfig } from '@angular/material/core';
import {AppService} from './app.service';
import {SharedModule} from './com/wedoapps/shared/shared.module';
import {UserIndividualGuard} from './com/wedoapps/guards/user-individual.guard';
import {InitialService} from './com/wedoapps/views/main/initial/initial.service';
import {MetafrenzyModule} from 'ngx-metafrenzy';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireModule} from '@angular/fire';
import {LangInterceptor} from "./com/wedoapps/interceptors/interceptor";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({

  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CookieModule.forRoot(),
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    MetafrenzyModule.forRoot(),
    AngularFireModule.initializeApp(environment.firbaseConfig),
    AngularFireAuthModule
  ],
  providers: [
    ApiService,
    AppService,
    InitialService,
    GoogleApiService,
    CookieService,
    UtilitesService,
    AuthGuard,
    UserService,
    DataShareService,
    SubjectsInteractionsService,
    UserIndividualGuard,
    Title,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GestureConfig
    },
    TransformErrorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LangInterceptor,
      multi: true
    },
  ],

  bootstrap: [AppComponent]
})
export class AppModule {
}
