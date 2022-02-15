import {Component, OnInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, FormControl, ControlValueAccessor} from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSORR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CreateLocationComponent),
    multi: true
};

@Component({
    selector: 'app-create-location',
    templateUrl: './create-location.component.html',
    styleUrls: ['./create-location.component.scss'],
    providers: [
        CUSTOM_INPUT_CONTROL_VALUE_ACCESSORR,
    ],
})
export class CreateLocationComponent implements OnInit, ControlValueAccessor {
    public hasError: boolean = false;
    @Input() isInCreatePage: boolean = false;
    @Input() control: FormControl = new FormControl();
    @Output() eventForMarkingTouched: EventEmitter<void> = new EventEmitter<void>();
    @Input() isErrorExist: boolean;
    @Input() description: string;
    @Input('hasError') set check(event) {
        this.hasError = event;
    };

    constructor() {
    }

    ngOnInit() {
        this.control.valueChanges.subscribe(data => {
            this.onChange();
        });
    }

    onChange() {
        this.propagateChange(this.control.value);
    }

    public propagateChange = (_: any) => {
    };

    public writeValue(value: any) {
        this.control.setValue(value);
    }

    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    public onTouchedCallback() {
        this.eventForMarkingTouched.emit();
    }


    public registerOnTouched(fn: any) {
    }

    public getAutocomplete(event: object): void {
        this.control.setValue(event);
    }
}
