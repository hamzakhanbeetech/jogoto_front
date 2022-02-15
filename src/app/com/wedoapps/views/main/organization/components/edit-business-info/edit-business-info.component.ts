import {FormBuilder, FormGroup} from '@angular/forms';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {UserModel} from '../../../../../models';
import {DataShareService} from '../../../../../services';

@Component({
    selector: 'app-edit-business-info',
    templateUrl: './edit-business-info.component.html',
    styleUrls: ['./edit-business-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditBusinessInfoComponent implements OnInit {
    public organization: UserModel;

    @Input('organization') set getOrganization(data: UserModel) {
        this.organization = data;
        this.businessGroup.get('budget_type').patchValue(data.budget_type.toUpperCase());
    }

    @Output()
    public businessData: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public cancelEdit: EventEmitter<boolean> = new EventEmitter<boolean>();

    public businessGroup: FormGroup;
    public carensy = [
        {label: 'EUR', value: 'EUR'},
        {label: 'CHF', value: 'CHF'},
    ];

    constructor(private _fb: FormBuilder,
                private _dataShareService: DataShareService) {
        this.businessGroup = this._fb.group({
            employees: [''],
            events_count_year: [''],
            attendees: [''],
            budget: [''],
            budget_type: ['']
        });
    }

    public saveBusinessInfo(): void {
        const body = {
        ...this.checkNumbers(this.businessGroup.getRawValue()),
      };

      this.businessData.emit(body);
    }

    public cancel(): void {
        this.cancelEdit.emit(true);
    }

    public replaceText(e, formControlName: string): void {
        const txt = e.target.value.replace(/[^\d]/g, '');
        this.businessGroup.patchValue({
            [formControlName]: txt,
        });
    }

    private checkNumbers(numbers){
        let result = numbers;
        for (let number in numbers ){
            if(numbers[number] && numbers[number].toString().length > 9){
                result[number] = Number(numbers[number].toString().slice(0, 9));
            }
        }
        return result
    }

    ngOnInit() {
      this.businessGroup.patchValue({
            employees: this.organization.employees,
            events_count_year: this.organization.events_count_year,
            attendees: this.organization.attendees,
            budget: this.organization.budget,
        });
    }

}
