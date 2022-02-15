import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {PreviewRoutingModule} from './preview-routing.module';
import {PreviewView} from './preview.view';
import {SharedModule} from '../../../../../shared/shared.module';
import {EventService} from '../../../event/event.service';

@NgModule({
  declarations: [PreviewView],
  imports: [
    CommonModule,
    PreviewRoutingModule,
    SharedModule,
    TranslateModule
  ],
    providers:[
        EventService
    ]
})
export class PreviewModule {
}
