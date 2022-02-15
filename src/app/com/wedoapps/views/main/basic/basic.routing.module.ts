import { SearchQueryParams } from './../search/search.models';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {BasicView} from './basic.view';

const basicRoutes: Routes = [
  {
    path: '', component: BasicView, children: [
      {path: '', redirectTo: 'home', pathMatch: 'full'},
      {path: 'calendar', loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule)},
      {path: 'my-invitations', loadChildren: () => import('./my-invitations/my-invitations.module').then(m => m.MyInvitationsModule)},
      {path: 'create-event', loadChildren: () => import('./create-event/create-event.module').then(m => m.CreateEventModule)},
      {path: 'create-group', loadChildren: () => import('./create-group/create-group.module').then(m => m.CreateGroupModule)},
      {path: 'followers', loadChildren: () => import('./followers-following/followers-following.module').then(m => m.FollowersFollowingModule)},
      {path: 'events/:id', loadChildren: () => import('./events/events.module').then(m => m.EventsModule)},
      {path: 'groups/:id', loadChildren: () => import('./groups/groups.module').then(m => m.GroupsModule)},
      {path: 'settings', loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)},
      {path: 'interests', loadChildren: () => import('./interests/interests.module').then(m => m.InterestsModule)},
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(basicRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BasicRoutingModule {
}
