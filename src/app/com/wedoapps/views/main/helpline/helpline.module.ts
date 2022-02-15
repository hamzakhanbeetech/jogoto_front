import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelplineView } from './helpline.view';
import { HelplineRoutingModule } from './helpline.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelplineService } from './helpline.service';

@NgModule({
  declarations: [HelplineView],
  imports: [
    HelplineRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule],
  providers: [HelplineService]
})
export class HelplineModule {
}