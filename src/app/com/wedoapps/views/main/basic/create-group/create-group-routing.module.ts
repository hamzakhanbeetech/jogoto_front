import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CreateGroupView} from './create-group.view';

const routes: Routes = [
  {path: '', component: CreateGroupView},
  { path: 'preview/:id', loadChildren: () => import('./preview-group/preview.module').then(m => m.PreviewModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateGroupRoutingModule {
}
