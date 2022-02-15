import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-filter-when',
  templateUrl: './filter-when.component.html',
  styleUrls: ['./filter-when.component.scss']
})
export class FilterWhenComponent implements OnInit {
  public isOk:boolean = false;
  public data;

  constructor() {
  }

  ngOnInit() {
  }

  public openChanged(ev){
      this.data = {isClosed: ev, isOk:this.isOk}
  }
  
}
