import {Component, Input, OnInit} from '@angular/core';
import {CategoryModel} from '../../../models/global.models';

@Component({
  selector: 'app-event-category-btn',
  templateUrl: './event-category-btn.component.html',
  styleUrls: ['./event-category-btn.component.scss']
})
export class EventCategoryBtnComponent implements OnInit {
  @Input() public category;

  public eventColor = {
    'color': '',
    'border-color': ''
  };

  constructor() {
  }

  ngOnInit() {
      const color = this.category.styleData? this.category.styleData.color : 'black';
    this.eventColor = {
      color,
      'border-color': color
    };
  }

}
