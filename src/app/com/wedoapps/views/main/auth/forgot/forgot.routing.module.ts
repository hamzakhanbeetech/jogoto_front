import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotView } from './forgot.view';

let forgotRoutes: Routes = [
    { path: '', component: ForgotView }
]

@NgModule({
    imports: [RouterModule.forChild(forgotRoutes)],
    exports: [RouterModule]
})
export class ForgotRoutingModule { }