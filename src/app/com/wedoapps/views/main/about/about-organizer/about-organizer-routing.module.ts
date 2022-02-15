import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AboutOrganizerComponent} from './about-organizer.component';

const routes: Routes = [{path: '', component: AboutOrganizerComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutOrganizerRoutingModule {
}
