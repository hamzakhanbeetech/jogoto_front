import { Injectable } from '@angular/core';
import { ApiService } from '../../../services';

@Injectable()
export class AuthService {

    constructor(private _apiService: ApiService) { }
}