import {NgbDatepickerI18n, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {Injectable} from '@angular/core';
import {SubjectsInteractionsService} from './subjects-interactions.service';
import {CalendarConstants} from '../constants/calendar.constants';

const I18N_VALUES = {
    'fr': {
        weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Séptembre', 'Octobre', 'Novembre', 'Décembre'],
    },
    'en': {
        weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa','Su'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    }
};

@Injectable()
export class DatepickerTranslateService extends NgbDatepickerI18n {
    private _lang: string = 'en';

    constructor(private _subject: SubjectsInteractionsService) {
        super();
        this.checkLang();
    }


    private checkLang() {
        this._subject.getCurrentLang()
            .subscribe(lang => {
                this._lang = lang;
            });
    }

    getWeekdayShortName(weekday: number): string {
        return I18N_VALUES[this._lang].weekdays[weekday - 1];
    }

    getMonthShortName(month: number): string {
        return I18N_VALUES[this._lang].months[month - 1];
    }

    getMonthFullName(month: number): string {
        return this.getMonthShortName(month);
    }

    getDayAriaLabel(date: NgbDateStruct): string {
        return `${date.day}-${date.month}-${date.year}`;
    }
}