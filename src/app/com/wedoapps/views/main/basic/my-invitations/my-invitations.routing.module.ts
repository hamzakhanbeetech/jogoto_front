import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyInvitationsView } from './my-invitations.view';

const myInvitationsRoutes: Routes = [
    { path: '', component: MyInvitationsView }
];

@NgModule({
    imports: [RouterModule.forChild(myInvitationsRoutes)],
    exports: [RouterModule]
})
export class MyInvitationsRoutingModule { }
