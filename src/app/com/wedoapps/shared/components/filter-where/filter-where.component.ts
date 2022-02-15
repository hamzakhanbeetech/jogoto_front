import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FiltersService } from '../../../services/filters.service';

@Component({
    selector: 'app-filter-where',
    templateUrl: './filter-where.component.html',
    styleUrls: ['./filter-where.component.scss']
})
export class FilterWhereComponent implements OnInit {
    public objectOfWhereValues: { radius: number, autocomplete: string };
    public buttonClick: boolean = false;
    public isOk:boolean = false;
    public data;
    public isOnline = 'isOnline'
    @Output() selectedWhereValues = new EventEmitter<{ radius: number, autocomplete: string }>();

    @ViewChild('button', { static: true }) public button: any;

    constructor(
      private _filtersService: FiltersService,) {
    }

    ngOnInit() {
    }


    public getValuesOfWhere(event): void {
        if (event) {
            this.objectOfWhereValues = event;
        }
    }

    public openDropDown(): boolean {
        return this.buttonClick = !this.buttonClick;
    }

    public sendValuesOfWhere(): void {
        this.selectedWhereValues.emit(this.objectOfWhereValues);
    }

    public setOnlineFilter(){
      this._filtersService.setOnline();

    }

    public openChanged(ev){
        this.buttonClick = !this.buttonClick
        this.data = {isClosed:ev, isOk:this.isOk};

    }

}
