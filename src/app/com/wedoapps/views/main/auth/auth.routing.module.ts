import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthView } from './auth.view';
import {MergeAccountsGuard} from '../../../guards/merge-accounts.guard';

let authRoutes: Routes = [
    {
        path: '', component: AuthView, children: [
            { path: 'forgot', loadChildren: () => import('./forgot/forgot.module').then(m => m.ForgotModule) },
            { path: 'recover', loadChildren: () => import('./recovery-password/recovery-password.module').then(m => m.RecoveryPasswordModule) },
            { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
            { path: 'registration', loadChildren: () => import('./registration/registration.module').then(m => m.RegistrationModule) },
            { path: 'merge-accounts', canActivate: [MergeAccountsGuard], loadChildren: () => import('./merge-accounts/merge-accounts.module').then(m => m.MergeAccountsModule) },
            { path: 'resend', loadChildren: () => import('./resend-password/resend-password.module').then(m => m.ResendPasswordModule)},
            { path: 'email-verification/:hashcode', loadChildren: () => import('./email-verification/email-verification.module').then(m => m.EmailVerificationModule) }
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
