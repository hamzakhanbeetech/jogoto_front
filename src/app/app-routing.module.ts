import {NgModule} from '@angular/core';
import {
  Routes,
  RouterModule,
  PreloadAllModules,
  ExtraOptions,
} from '@angular/router';
import {AuthGuard} from './com/wedoapps/guards/auth.guard';

const appRoutes: Routes = [
  {path: '', canActivate: [AuthGuard], loadChildren: () => import('./com/wedoapps/views/main/main.module').then(m => m.MainModule),
    data: {
      metafrenzy: {
        title: '',
        tags: [
          {
            name: 'og:title',
            content: ''
          }, {
            name: 'og:description',
            content: ''
          }, {
            name: 'og:image',
            content: ''
          }
        ],
        links: [
          {
            rel: 'canonical',
            href: 'http://localhost/'
          }
        ]
      }
    }},
];
const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'disabled',
  anchorScrolling: 'enabled',
  scrollOffset: [0, 64],
  initialNavigation: 'enabled',
  onSameUrlNavigation: 'reload',
  preloadingStrategy: PreloadAllModules ,
};

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, routerOptions,
  )],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
