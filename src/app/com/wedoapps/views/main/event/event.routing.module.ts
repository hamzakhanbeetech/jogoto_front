import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventView } from './event.view';

const eventsRoutes: Routes = [
    { path: '', component: EventView }
];

@NgModule({
    imports: [RouterModule.forChild(eventsRoutes)],
    exports: [RouterModule]
})
export class EventRoutingModule { }
