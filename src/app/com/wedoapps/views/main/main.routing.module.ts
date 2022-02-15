import {NgModule} from '@angular/core';
import {Routes, RouterModule, UrlMatcher, UrlSegment, UrlSegmentGroup, Route} from '@angular/router';

import {BasicModuleGuard} from '../../guards/basic-module.guard';
import {AuthModuleGuard} from '../../guards/auth-module.guard';
import {MainView} from './main.view';
import {RouterGuard} from "../../guards/router.guard";

// const test: UrlMatcher = (segs) => {
//   console.log(segs)
//   return null
// }

const mainRoutes: Routes = [
  {
    path:"",  component: MainView, children: [
      {path: ':ln',  canActivate:[RouterGuard], loadChildren: () => import('./initial/initial.module').then(m => m.InitialModule)},
      {path: ':ln/',  canActivate:[RouterGuard], loadChildren: () => import('./initial/initial.module').then(m => m.InitialModule)},
      {path: ':ln/auth',  canActivate: [AuthModuleGuard,RouterGuard], loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
      {path: ':ln/basic',  canActivate: [BasicModuleGuard,RouterGuard], loadChildren: () => import('./basic/basic.module').then(m => m.BasicModule)},
      {path: ':ln/search',canActivate:[RouterGuard], loadChildren: () => import('./search/search.module').then(m => m.SearchModule)},
      {path: ':ln/about',canActivate:[RouterGuard], loadChildren: () => import('./about/about.module').then(m => m.AboutModule)},
      {path: ':ln/contact-us',canActivate:[RouterGuard], loadChildren: () => import('./contact-us/contact-us.module').then(m => m.ContactUsModule)},
      {path: ':ln/helpline',canActivate:[RouterGuard], loadChildren: () => import('./helpline/helpline.module').then(m => m.HelplineModule)},
      {path: ':ln/event/:id',canActivate:[RouterGuard], loadChildren: () => import('./event/event.module').then(m => m.EventModule)},
      {path: ':ln/group/:id',canActivate:[RouterGuard], loadChildren: () => import('./group/group.module').then(m => m.GroupModule)},
      {path: ':ln/user',canActivate:[RouterGuard], loadChildren: () => import('./user-profile/user-profile.module').then(m => m.UserProfileModule)},
      {path: ':ln/organization',canActivate:[RouterGuard], loadChildren: () => import('./organization/organization.module').then(m => m.OrganizationModule)},
      {path: ':ln/term-of-use',canActivate:[RouterGuard], loadChildren: () => import('./term-of-use/term-of-use.module').then(m => m.TermOfUseModule)},
      {path: ':ln/privancy-policy',canActivate:[RouterGuard], loadChildren: () => import('./privancy-policy/privancy-policy.module').then(m => m.PrivancyPolicyModule)},
    ],
},
  {path: '**', redirectTo: "/" }
];

@NgModule({
  imports: [RouterModule.forChild(mainRoutes)],
  exports: [RouterModule]
})
export class MainRoutingModule {}
