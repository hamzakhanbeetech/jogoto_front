import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SettingView} from './setting.view';

const routes: Routes = [{path: '', component: SettingView}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule {
}
