import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {EventModel} from '../../../../../models/global.models';

@Component({
  selector: 'app-map-and-events',
  templateUrl: './map-and-events.component.html',
  styleUrls: ['./map-and-events.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapAndEventsComponent implements OnInit {
  @Input('events')
  public events: EventModel[];
  @Input()
  public loading = true;
  @Input('isGridMap')
  public isGridMap;
  public hover:any;
  public hoveredEventId:string = '';
  @Input('searchDate') public searchDate;

  constructor() {
  }

  public getEventHoverState(id, state){
      if(this.hoveredEventId !== id || !state ){
        this.hoveredEventId = id;
        this.hover = {
            id,
            state
        }
    }

    if(!state){
        this.hoveredEventId = ''
    }
  }

  ngOnInit() {
  }
}
