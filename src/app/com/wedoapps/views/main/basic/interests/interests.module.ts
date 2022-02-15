import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterestsRoutingModule } from './interests-routing.module';
import {InterestsComponent} from './interests.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../../shared/shared.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [InterestsComponent],
  imports: [
    CommonModule,
    InterestsRoutingModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class InterestsModule { }
