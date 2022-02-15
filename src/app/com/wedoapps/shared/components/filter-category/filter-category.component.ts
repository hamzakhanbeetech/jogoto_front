import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-filter-category',
  templateUrl: './filter-category.component.html',
  styleUrls: ['./filter-category.component.scss']
})
export class FilterCategoryComponent implements OnInit {
  public isOK:boolean = false;
  public data;

  constructor() {
  }

  public openChanged(ev){
      this.data = {isClosed:ev, isOk:this.isOK}
  }

  ngOnInit() {
  }
}
