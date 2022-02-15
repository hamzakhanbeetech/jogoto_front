import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactUsView } from './contact-us.view';

let contactUsRoutes: Routes = [
    { path: '', component: ContactUsView }
]

@NgModule({
    imports: [RouterModule.forChild(contactUsRoutes)],
    exports: [RouterModule]
})
export class ContactUsRoutingModule { }