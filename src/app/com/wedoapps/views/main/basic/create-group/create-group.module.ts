import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateGroupView } from './create-group.view';
import { CreateGroupRoutingModule } from './create-group-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../../shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CreateEventService} from '../create-event/create-event.service';
import {CreateGroupService} from './create-group.service';


@NgModule({
  declarations: [
    CreateGroupView
  ],
  imports: [
    CommonModule,
    CreateGroupRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
      NgbModule
  ],
    providers:[
        CreateEventService,
        CreateGroupService,
    ]
})
export class CreateGroupModule {
}
