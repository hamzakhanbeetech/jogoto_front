import {Component, Input, OnInit} from '@angular/core';
import {NoResultModel} from '../../../../../models/global.models';

@Component({
  selector: 'app-no-search-result',
  templateUrl: './no-search-result.component.html',
  styleUrls: ['./no-search-result.component.scss']
})
export class NoSearchResultComponent implements OnInit {
  @Input('noSearchResult') public noSearchResult: any;

  constructor() {
  }

  ngOnInit() {
  }

}
