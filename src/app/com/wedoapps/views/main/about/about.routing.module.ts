import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AboutView} from './about.view';

const aboutRoutes: Routes = [
  {
    path: '', component: AboutView, children: [
      {path: '', loadChildren: () => import('./main-about/main-about.module').then(m => m.MainAboutModule)},
      {path: 'individual', loadChildren: () => import('./about-individual/about-individual.module').then(m => m.AboutIndividualModule)},
      {path: 'organizer', loadChildren: () => import('./about-organizer/about-organizer.module').then(m => m.AboutOrganizerModule)}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(aboutRoutes)],
  exports: [RouterModule]
})
export class AboutRoutingModule {
}
