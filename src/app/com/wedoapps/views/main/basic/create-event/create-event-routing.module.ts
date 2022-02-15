import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEventView } from './create-event.view';

const routes: Routes = [
  { path: '', component: CreateEventView },
  { path: ':eventId/preview', loadChildren: () => import('./preview/preview.module').then(m => m.PreviewModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateEventRoutingModule { }
