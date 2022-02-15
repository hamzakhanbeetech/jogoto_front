import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TermOfUseComponent} from './term-of-use.component';

const routes: Routes = [{path: '', component: TermOfUseComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermOfUseRoutingModule {
}
