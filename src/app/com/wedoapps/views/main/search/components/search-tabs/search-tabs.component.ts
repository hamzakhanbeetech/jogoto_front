import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';

import {SubjectsInteractionsService} from '../../../../../services/subjects-interactions.service';
import {EventModel} from '../../../../../models/global.models';
import {Subscription} from 'rxjs';
import {TabsetComponent} from 'ngx-bootstrap';

@Component({
  selector: 'app-search-tabs',
  templateUrl: './search-tabs.component.html',
  styleUrls: ['./search-tabs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchTabsComponent implements OnInit, OnDestroy {
  public showMap: boolean;
  public hideEventColumn: boolean;
  public events: EventModel[];
  public isGridMap: boolean = true;
  private _subscription: Subscription = new Subscription();
  public isScroll = false;
  @Input() public loading = true;
  @Input('searchDate') public searchDate:any;
  @Input('isScroll')  set getIsScroll(a){
      this.isScroll = false
  }
  @Output() public onChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public checkPopularToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('tabs', { static: true }) public staticTab: TabsetComponent;

  constructor(private _subjectsIteractionsService: SubjectsInteractionsService) {
  }

  ngOnInit() {
    this.showMap = false;
    this.hideEventColumn = false;
    this._getEvents();
    // this.checkPopularToggle.emit(false);
  }

  private _getEvents(): void {
    this._subscription = this._subjectsIteractionsService.searchedEventsState
      .subscribe((value: EventModel[]): void => {
        this.events = value;
      });
  }

  public tabChanged(value: boolean): void {
      this.isGridMap = value;
      this.onChanged.emit(value);
  }

  public onChangeColumn(e): boolean {
    // this._subjectsIteractionsService.changeMapState(e.checked)
    return this.hideEventColumn = e.checked;
  }

  public onChangePopularity(e): void {
    this.checkPopularToggle.emit(e.checked);
  }

  ngOnDestroy() {
      this._subscription.unsubscribe();
  }
}
