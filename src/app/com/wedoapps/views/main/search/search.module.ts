import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SearchView } from './search.view';
import { TranslateModule } from '@ngx-translate/core';
import { SearchRoutingModule } from './search.routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { SearchService } from './search.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  SelectedFiltersComponent,
  SearchTabsComponent,
  MapAndEventsComponent,
} from './components';
import { InitialView } from '../initial/initial.view';
import { InitialService } from '../initial/initial.service';
import { DropdownModule } from 'primeng/dropdown';
import {FiltersService, TransformErrorService} from '../../../services';


@NgModule({
  declarations: [
    SearchView,
    SelectedFiltersComponent,
    SearchTabsComponent,
    MapAndEventsComponent,
  ],
  imports: [
    SearchRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    MatSelectModule,
    MatSlideToggleModule,
    TabsModule.forRoot(),
    DropdownModule
  ],
  providers: [
    SearchService,
    InitialView,
    InitialService,
    FiltersService,
    DatePipe,
    TransformErrorService
  ],
  exports: []
})
export class SearchModule {
}
