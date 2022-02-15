import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarView } from './calendar.view';

const calendarRoutes: Routes = [
    { path: '', component: CalendarView }
];

@NgModule({
    imports: [RouterModule.forChild(calendarRoutes)],
    exports: [RouterModule]
})
export class CalendarRoutingModule { }
