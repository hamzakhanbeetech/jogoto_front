import {BehaviorSubject, Observable} from 'rxjs';
import {EventEmitter} from '@angular/core';

export class SidebarFilterService {
  private static filterData: BehaviorSubject<object> = new BehaviorSubject<object>(null);
  public static resetAction: EventEmitter<void> = new EventEmitter();

  static setFilterData(filteredData: object): void {
    const currentData = SidebarFilterService.getFilterData() ? SidebarFilterService.getFilterData() : {};

    SidebarFilterService.filterData.next({...currentData, ...filteredData});
  }

  static setEmptyData(): void {
    SidebarFilterService.filterData.next({});
  }

  static getFilterData(): object {
    return SidebarFilterService.filterData.getValue();
  }

  static getFilterAsObservable(): Observable<object> {
    return SidebarFilterService.filterData.asObservable();
  }
}
