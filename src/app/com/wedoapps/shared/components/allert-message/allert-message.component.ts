import {Component, OnInit, Input, OnDestroy} from '@angular/core';

import {SendInfoToAlertMessage} from '../../../models';
import {SubjectsInteractionsService} from '../../../services';
import {Subject, timer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-allert-message',
    templateUrl: './allert-message.component.html',
    styleUrls: ['./allert-message.component.scss']
})
export class AllertMessageComponent implements OnInit, OnDestroy {
    @Input()
    public successOrNot: SendInfoToAlertMessage;
    public display: boolean;
    private type: string;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private _subjectsIteractionsService: SubjectsInteractionsService) {
    }

    ngOnInit() {
        this.subscribeToData();
    }

    private subscribeToData(): void {
        this._subjectsIteractionsService.errorSuccessMessag
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(data => {
                if (data) {
                    this.successOrNot = data;
                    this.display = data.display;
                    this.type = data.type;
                    if (data.type !== 'cookies') {
                        timer(4500)
                            .subscribe(() => {
                                this.display = false;
                                this.successOrNot = null;
                            });
                    }
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public clickToClose(): void {
        this.display = false;
        if (this.type === 'cookies') {
            sessionStorage.setItem('cookies', 'true');
        }
    }
}
