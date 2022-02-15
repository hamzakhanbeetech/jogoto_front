import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailVerificationView } from './email-verification.view';

let emailVerificationRoutes: Routes = [
    { path: '', component: EmailVerificationView }
]

@NgModule({
    imports: [RouterModule.forChild(emailVerificationRoutes)],
    exports: [RouterModule]
})
export class EmailVerificationRoutingModule { }