import {Injectable, ComponentFactoryResolver, ViewContainerRef} from '@angular/core';

import {CalendarDropdownComponent} from '../shared/components/calendar-dropdown/calendar-dropdown.component';

@Injectable({
  providedIn: 'root'
})
export class CalendarDropdownService {

  constructor(private resolver: ComponentFactoryResolver) {
  }

  public createAndGetCalendarDropdown(elementRef: ViewContainerRef, params) {
    elementRef.clear();
    const factory = this.resolver.resolveComponentFactory(CalendarDropdownComponent);
    const componentRef = elementRef.createComponent(factory);
    componentRef.instance.elementPosition = {top: params.top, left: params.left, right: params.right};
    componentRef.instance.eventId = params.eventId;
    componentRef.instance.showDeleteEvent = params.showDeleteEvent;

    return componentRef.location.nativeElement;
  }

  public getOffset(jsEvent, el, parentNode) {
    const clientY = jsEvent.clientY;
    const clientX = jsEvent.clientX;
    const parentNodeRect = parentNode.getBoundingClientRect();

    return {top: clientY - parentNodeRect.top, left: clientX - parentNodeRect.left};
  }
}
