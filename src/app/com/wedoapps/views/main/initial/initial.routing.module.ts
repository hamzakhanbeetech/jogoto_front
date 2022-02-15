import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InitialView } from './initial.view';

const initialRoutes: Routes = [
    { path: '', component: InitialView }
];

@NgModule({
    imports: [RouterModule.forChild(initialRoutes)],
    exports: [RouterModule]
})
export class InitialRoutingModule { }
