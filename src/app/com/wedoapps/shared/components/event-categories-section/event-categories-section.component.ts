import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-event-categories-section',
  templateUrl: './event-categories-section.component.html',
  styleUrls: ['./event-categories-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventCategoriesSectionComponent implements OnInit {
  @Input() public categories;

  constructor() {
  }

  ngOnInit() {

  }

}
