import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PreviewView} from './preview.view';


const routes: Routes = [{ path: '', component: PreviewView }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreviewRoutingModule { }
