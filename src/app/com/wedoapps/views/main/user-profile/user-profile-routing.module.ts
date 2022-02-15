import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserProfileView} from './user-profile.view';

const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: ':id', component: UserProfileView},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule {
}
