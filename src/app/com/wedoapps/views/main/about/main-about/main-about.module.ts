import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainAboutRoutingModule } from './main-about-routing.module';
import { MainAboutComponent } from './main-about.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from "../../../../shared/shared.module";

@NgModule({
  declarations: [MainAboutComponent],
    imports: [
        CommonModule,
        MainAboutRoutingModule,
        TranslateModule,
        SharedModule
    ]
})
export class MainAboutModule { }
