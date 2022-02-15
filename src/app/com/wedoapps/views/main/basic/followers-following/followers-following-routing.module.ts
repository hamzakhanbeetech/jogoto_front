import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {FollowersFollowingView} from './followers-following.view';

const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: ':id', component: FollowersFollowingView}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class FollowersFollowingRoutingModule {
}
