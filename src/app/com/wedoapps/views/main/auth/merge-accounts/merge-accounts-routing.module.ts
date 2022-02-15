import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MargingAccountsComponent} from './components/root/marging-accounts.component';

const routes: Routes = [
    { path: '', component: MargingAccountsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MergeAccountsRoutingModule { }
