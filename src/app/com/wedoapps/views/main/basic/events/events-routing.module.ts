import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {EventsView} from './events.view';
import {MetafrenzyGuard} from 'ngx-metafrenzy';

const routes: Routes = [{
  path: '', component: EventsView, canActivate: [MetafrenzyGuard],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule {
}
