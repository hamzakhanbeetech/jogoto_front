import { Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {SubjectsInteractionsService} from '../../../services';
import {Router} from '@angular/router';

@Component({
    selector: 'app-mat-modal',
    templateUrl: './mat-modal.component.html',
    styleUrls: ['./mat-modal.component.scss'],
})
export class MatModalComponent implements OnInit, OnDestroy {
    public isDynamicSearch: boolean = false;
    public saveState: boolean = false;
    public filterData;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                private _subjectInteractionService:SubjectsInteractionsService,
                private _router:Router) {
        if (this.data) {
            if(this.data.isDynamicSearch){
                this.isDynamicSearch = this.data.isDynamicSearch;
            }

            if(this.data.saveState){
                this.saveState = this.data.saveState
            }
        }
    }

    close(){
        if(this._router.url.length <= 3 ){
            this.filterData = {isClose:false, isOk:true}
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

}
