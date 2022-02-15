import {Component, Input, OnInit} from '@angular/core';
import {EventDataModel} from '../../../views/main/initial/initial.models';

@Component({
  selector: 'app-event-short-descriptiopn',
  templateUrl: './event-short-descriptiopn.component.html',
  styleUrls: ['./event-short-descriptiopn.component.scss']
})
export class EventShortDescriptiopnComponent implements OnInit {
  @Input('data') public data: EventDataModel;
  @Input('hrefTarget') public hrefTarget: string = '_self';
  @Input('isShowDescription') public isShowDescription: boolean = true;
  @Input('locale') locale: string;
  @Input('filterType') filterType: string;
  @Input('isSettingsPage') isSettingPage: boolean = false;
  public isSameDay: boolean;

  constructor() {
  }

  ngOnInit() {
    this.isSameDay = new Date(this.data.date.start).getMonth() === new Date(this.data.date.end).getMonth()
      && new Date(this.data.date.start).getDate() === new Date(this.data.date.end).getDate();
  }
}
