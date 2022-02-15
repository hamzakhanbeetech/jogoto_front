import {Component, Input, OnInit} from '@angular/core';
import {NoResultModel} from '../../../models/global.models';

@Component({
  selector: 'app-no-event',
  templateUrl: './no-event.component.html',
  styleUrls: ['./no-event.component.scss']
})
export class NoEventComponent implements OnInit {
  @Input('noResult') public noResult: NoResultModel;

  constructor() {
  }

  ngOnInit() {
  }

}
