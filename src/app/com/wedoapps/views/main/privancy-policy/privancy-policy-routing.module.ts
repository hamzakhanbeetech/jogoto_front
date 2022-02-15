import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PrivancyPolicyComponent} from './privancy-policy.component';

const routes: Routes = [{path: '', component: PrivancyPolicyComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivancyPolicyRoutingModule {
}
