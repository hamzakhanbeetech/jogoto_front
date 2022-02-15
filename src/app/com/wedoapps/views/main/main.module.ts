import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main.routing.module';
import { MainView } from './main.view';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BasicModuleGuard } from '../../guards/basic-module.guard';
import { AuthModuleGuard } from '../../guards/auth-module.guard';
import {HeaderComponent, NotificationsComponent} from '../../components';
import {TransformErrorService} from '../../services';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {RouterGuard} from "../../guards/router.guard";

@NgModule({
  declarations: [
    MainView,
    HeaderComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    TranslateModule,
    BsDropdownModule.forRoot(),
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [
    BasicModuleGuard,
    AuthModuleGuard,
    RouterGuard, 
    TransformErrorService
  ]
})
export class MainModule {
    constructor() {
        registerLocaleData(localeFr, 'fr');
    }
}
