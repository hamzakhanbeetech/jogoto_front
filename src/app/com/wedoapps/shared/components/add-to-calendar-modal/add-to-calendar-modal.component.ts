import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {DatesOfEvents} from '../../../models/global.models';
import {FormGroup, FormBuilder, FormControl, FormArray, Validators} from '@angular/forms';
import * as moment from 'moment';
import {UtilitesService} from '../../../services';

@Component({
  selector: 'app-add-to-calendar-modal',
  templateUrl: './add-to-calendar-modal.component.html',
  styleUrls: ['./add-to-calendar-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddToCalendarModalComponent implements OnInit {
  public datesOfEvent: Array<DatesOfEvents> = [];
  public selectedItems: Array<string> = [];
  private _datesForm: FormGroup;
  public skip: number = 0;
  public limit: number = 8;
  public isFull: boolean = true;
  public dateHidden: boolean;
  public locale:string = 'en';

  constructor(public dialogRef: MatDialogRef<AddToCalendarModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _fb: FormBuilder, private utilities:UtilitesService) {
    this.dateHidden = data.startTimeHidden;
    this.locale = data.lang;
    this.datesOfEvent = this.data.dates.filter((date: any, index) => {
      return new Date(date.start) > new Date();
    });
  }

  ngOnInit() {
    this._formBuilder();
    this.setDefaultValue();
  }

  private setDefaultValue() {
      const itemsArray = this._datesForm.get('items') as FormArray;
      const idsTmp = this.datesOfEvent.map(item => {
          if(item.zone){
              return this.utilities.setTimeZone(item, 'start', item.zone, true) + '.000Z';
        }
          return item.start
      });
    const i = this.data.user_calendar.length - 1 ;
    const element = this.data.user_calendar;

      let index;
    for (let j = 0; j < element.length; j++) {
      const item = element[j];
        index = idsTmp.indexOf(item);
      if (index > -1) {
        itemsArray.controls[index].setValue(true);
      }
    }
  }

  get itemsControl(): FormArray {
    const controls = this._datesForm.get('items') as FormArray;
    return controls;
  }

  public onScroll(): void {
    this.skip += 8;
    this.limit += 8;
    const itemsArray = this._datesForm.get('items') as FormArray;
    this._buildFormArray();

  }

  private _formBuilder(): void {
    this._datesForm = this._fb.group({
      checkAll: new FormControl(false, Validators.required),
      items: this._fb.array([], Validators.required),
    }, {validator: this._validateCheckboxes()});
    this._datesForm.setControl('items', this._buildFormArray());

  }

  public onClickCheckAll(event) {
    const itemsArray = this._datesForm.get('items') as FormArray;
    itemsArray.controls.forEach((element: FormControl, index: number) => {
      element.setValue(event.checkboxValue);
    });
  }

  private _validateCheckboxes(): object {
    return (group: FormGroup): { [key: string]: any } => {
      let isValid = false;
      let isFull = true;
      const itemsArray = group.get('items') as FormArray;
      itemsArray.controls.forEach((element: FormControl) => {
        if (element.value) {
          isValid = true;
        } else {
          isFull = false;
        }
      });

      if (this.isFull = isFull) {
        this.isFull = isFull;
      }
      return {
        validCheckbox: isValid
      };
    };

  }

  private _handleOnSearchEvent(): void {
    let itemsArray = this._datesForm.get('items') as FormArray;
    itemsArray.controls.forEach((element: FormControl, index: number) => {
      if (element.value) {
          let date  = this.datesOfEvent[index].start;
          if(this.datesOfEvent[index].zone){
              date  =  this.utilities.setTimeZone(this.datesOfEvent[index], 'start', this.datesOfEvent[index].zone, true) + '.000Z';
          };
          this.selectedItems.push(date);
      }
    });
  }

  private _buildFormArray(): FormArray {
    let itemsArray = this._datesForm.get('items') as FormArray;
    let dates = this.datesOfEvent.slice(this.skip, this.limit);
    dates.forEach((element: any, index) => {
      itemsArray.push(new FormControl(false));
    });
    return itemsArray;
  }


  get datesForm(): FormGroup {
    return this._datesForm;
  }

  public onClickSave(): void {
    this._handleOnSearchEvent();
    this.dialogRef.close(this.selectedItems);
  }


}
