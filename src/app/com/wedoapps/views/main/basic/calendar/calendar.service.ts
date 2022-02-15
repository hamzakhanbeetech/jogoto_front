import { Injectable } from '@angular/core';
import { ApiService } from '../../../../services';

@Injectable()
export class CalendarService {

    constructor(private _apiService: ApiService) { }
}