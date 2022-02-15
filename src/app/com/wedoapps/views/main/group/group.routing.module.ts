import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupView } from './group.view';

let groupsRoutes: Routes = [
    { path: '', component: GroupView }
]

@NgModule({
    imports: [RouterModule.forChild(groupsRoutes)],
    exports: [RouterModule]
})
export class GroupRoutingModule { }
