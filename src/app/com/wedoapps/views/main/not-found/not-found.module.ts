import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundRoutingModule } from './not-found.routing.module';
import { NotFoundView } from './not-found.view';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  declarations: [
    NotFoundView
  ],
  imports: [
    CommonModule,
    NotFoundRoutingModule,
    TranslateModule,
    SharedModule
  ]
})
export class NotFoundModule { }
