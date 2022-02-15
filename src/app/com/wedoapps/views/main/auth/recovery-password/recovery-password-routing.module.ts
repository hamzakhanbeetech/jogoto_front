import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RecoveryPasswordView} from './recovery-password.view';

const RecoveryPasswordRoutes: Routes = [
  { path: '', component: RecoveryPasswordView }
];

@NgModule({
  imports: [RouterModule.forChild(RecoveryPasswordRoutes)],
  exports: [RouterModule]
})
export class RecoveryPasswordRoutingModule { }
