import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PreviewRoutingModule} from './preview-routing.module';
import {PreviewView} from './preview.view';
import {SharedModule} from '../../../../../shared/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {PreviewService} from './preview.service';
import {InitialService} from '../../../initial/initial.service';
import {GroupService} from '../../../group/group.service';

@NgModule({
  declarations: [PreviewView],
  imports: [
    CommonModule,
    PreviewRoutingModule,
    SharedModule,
    TranslateModule,
    TabsModule.forRoot(),
  ],
  providers: [
    PreviewService,
      InitialService,
      GroupService
  ]
})
export class PreviewModule {
}
