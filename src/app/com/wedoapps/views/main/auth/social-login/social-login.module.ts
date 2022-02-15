import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SocialLoginComponent} from './components/root/social-login.component';

@NgModule({
    declarations: [
        SocialLoginComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SocialLoginComponent
    ]
})
export class SocialLoginModule {
}
