import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {SharedModule} from '../../../../shared/shared.module';
import {SettingRoutingModule} from './setting-routing.module';
import {SettingView} from './setting.view';
import {TabsModule} from 'ngx-bootstrap';

@NgModule({
  declarations: [
    SettingView
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    TabsModule.forRoot(),
    SharedModule,
    MatSlideToggleModule,

  ]
})
export class SettingModule {
}
