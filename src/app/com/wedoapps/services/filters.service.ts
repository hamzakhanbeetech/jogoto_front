import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectedFilters, SelectedAutocompleteModel, SelectedCategoriesModel, SelectedFiltersModel } from '../models/global.models';

@Injectable()
export class FiltersService {
    private _selectedFilters: SelectedFilters = new SelectedFilters();
    public isOnline = new Subject()

    constructor() {

    }

    public setAutocomplete(autocomplete: SelectedAutocompleteModel): void {
        this._selectedFilters.autocomplete = autocomplete;
    }

    public setDistance(distance: number): void {
        this._selectedFilters.distance = distance;
    }

    public setOnline(): void {
        this._selectedFilters.isOnline = !this._selectedFilters.isOnline;
        this.isOnline.next(this._selectedFilters.isOnline)
    }

    public setFilters(filters: SelectedFiltersModel): void {
        this._selectedFilters.filters = filters;
    }

    public setCategories(categories: SelectedCategoriesModel): void {
        this._selectedFilters.categories = categories;
    }

    public setCalendar(calendar: { fromDate: any, toDate: any }): void {
        this._selectedFilters.calendar = calendar;
    }

    public resetFilters():void{
        this._selectedFilters = new SelectedFilters();
    }

    public getSelectedFilters(): SelectedFilters {
        return this._selectedFilters;
    }


}
