import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ResendPasswordView} from './resend-password.view';

const resendPasswordRoutes: Routes = [
  { path: '', component: ResendPasswordView }
];

@NgModule({
  imports: [RouterModule.forChild(resendPasswordRoutes)],
  exports: [RouterModule]
})
export class ResendPasswordRoutingModule { }