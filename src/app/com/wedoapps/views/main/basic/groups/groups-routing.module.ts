import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GroupsView} from './groups.view';

const routes: Routes = [{path: '', component: GroupsView}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule {
}
