import { Component, Input, OnInit, EventEmitter, Output, forwardRef } from '@angular/core';
import {FormControl, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import { Subscription } from 'rxjs';
import { SubjectsInteractionsService } from '../../../../../services';
import { EventModel } from '../../../../../models/global.models';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CreateNameComponent),
  multi: true
};
@Component({
  selector: 'app-create-name',
  templateUrl: './create-name.component.html',
  styleUrls: ['./create-name.component.scss'],
  providers: [
    CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,
  ],
})
export class CreateNameComponent implements OnInit {
  @Input() description: string;
  @Input() hasError: boolean = false;
  @Input() serverErr:string;
  @Input() isEventCreate:boolean = false;
  @Output() eventForMarkingTouched: EventEmitter<void> = new EventEmitter<void>();

  private _controlSubscriber: Subscription = new Subscription();
  public control: FormControl = new FormControl(null,Validators.required);
  private _createEventDuplicatedSubscriber: Subscription = new Subscription();
  constructor(
    private _subjectInteractionService: SubjectsInteractionsService,
    ) { }

    ngOnInit() {
        this._subscribeToControlChanges();
        this._subscribeToCreateEvent();
    }

    private _subscribeToCreateEvent(): void {
        this._createEventDuplicatedSubscriber = this._subjectInteractionService.eventCreateDuplicated.subscribe((event: EventModel) => {
            this.control.setValue(event.name);
        });
    }

  private _subscribeToControlChanges(): void {
    this._controlSubscriber = this.control.valueChanges.subscribe((value: string) => {
      this.onChange();
    })
  }
  onChange() {
    this.propagateChange(this.control.value);
  }

  public propagateChange = (_: any) => { }

  public writeValue(value: any) {
    this.control.setValue(value);
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any) {

  }
  ngOnDestroy() {
    this._controlSubscriber.unsubscribe()
    this._createEventDuplicatedSubscriber.unsubscribe();
  }
}
