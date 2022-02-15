import { NgModule } from '@angular/core';
import { InitialView } from './initial.view';

import { InitialRoutingModule } from './initial.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InitialService } from './initial.service';
import { CommonModule } from '@angular/common';
import {
  UtilitesService, FiltersService, TransformErrorService,
} from '../../../services';

@NgModule({
  declarations: [
    InitialView,
  ],
  imports: [
    InitialRoutingModule,
    SharedModule,
    TranslateModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  providers: [
    InitialService,
    UtilitesService,
    FiltersService,
    TransformErrorService
  ],
  exports: []
})
export class InitialModule {
}
