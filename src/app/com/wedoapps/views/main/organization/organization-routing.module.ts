import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrganizationComponent} from './components/organization/organization.component';

const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: ':id', component: OrganizationComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {
}
