import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-created-pages-type',
  templateUrl: './created-pages-type.component.html',
  styleUrls: ['./created-pages-type.component.scss']
})
export class CreatedPagesTypeComponent implements OnInit {
  @Input('checkType') checkType: Array<object>;
  @Input('title') title: string;
  @Input('checked') checked: string;
  @Output('value') value: EventEmitter<string> = new EventEmitter<string>();
  constructor() {
  }
  ngOnInit() {
  }

}
