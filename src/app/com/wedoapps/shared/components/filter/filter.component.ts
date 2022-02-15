import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterComponent implements OnInit {
public isClosed:boolean = true;
public data;
public isOk:boolean = false;
  constructor() { }

  ngOnInit() {}

    public openChanged(ev){
       this.data = {isClosed:ev, isOk:this.isOk}
    }

}
