import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AboutIndividualComponent} from './about-individual.component';

const routes: Routes = [{path: '', component: AboutIndividualComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutIndividualRoutingModule {
}
