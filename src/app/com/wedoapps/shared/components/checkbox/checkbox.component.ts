import { Component, Input, OnInit, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true
};
@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})


export class CheckboxComponent implements OnInit {
  @Input() filterName;
  @Input() checkboxId:number;
  @Input('value') set parentValue($event) {
      this.c.setValue($event, { emitEvent: false });
  }
  @Output() chackboxValue = new EventEmitter<{ checkboxValue: boolean, filtername: string }>();
  @Output() changeFilterData = new EventEmitter<{ checkboxValue: boolean, filtername: string }>();
  private innerValue: any = '';

  c: FormControl = new FormControl();

  constructor() { }

  ngOnInit() {
    this.c.valueChanges.subscribe((value) => {
      this.onChange(value);
    })
  }

  public onChangeFilterData(event): void {
      this.changeFilterData.emit({ checkboxValue: event.target.value, filtername: this.filterName });
  }

  public onChange(event): void {
    this.innerValue = event;
    this.chackboxValue.emit({ checkboxValue: event, filtername: this.filterName })
    this.propagateChange(this.innerValue);
  }

  public propagateChange = (_: any) => { }

  public writeValue(value: any) {
    this.innerValue = value;
    this.c.patchValue(value);

  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any) { }
  get value(): any {
    return this.innerValue;
  };
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
    }
  }
}
