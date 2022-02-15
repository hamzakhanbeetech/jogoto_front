import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationView } from './registration.view';

let registrationRoutes: Routes = [
    { path: '', component: RegistrationView }
]

@NgModule({
    imports: [RouterModule.forChild(registrationRoutes)],
    exports: [RouterModule]
})
export class RegistrationRoutingModule { }