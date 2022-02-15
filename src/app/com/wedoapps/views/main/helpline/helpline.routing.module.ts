import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelplineView } from './helpline.view';

let helplineRoutes: Routes = [
    { path: '', component: HelplineView }
]

@NgModule({
    imports: [RouterModule.forChild(helplineRoutes)],
    exports: [RouterModule]
})
export class HelplineRoutingModule { }