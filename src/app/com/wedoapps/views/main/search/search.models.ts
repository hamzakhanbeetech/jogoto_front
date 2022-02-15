import { CategoryModel } from '../../../models/global.models';

export interface SearchQueryParams {
    query: string;
    text: string
}
export interface FieldsOfSearching {
    autocomplete?: string;
    distance: string;
    categories: string;
    start_date: string;
    end_date: string;
    query: string;
    filter: string;
    lat: string;
    lon: string;
    type: string;
    userType?: string;
    southWestLat?: string;
    southWestLng?: string;
    northEastLat?: string;
    northEastLng?: string;
    northWestLat?: string;
    northWestLng?: string;
    southEastLat?: string;
    southEastLng?: string;
    isSearched?:boolean;
    searchedText?:string;
    zone?:string;
    isOnline: boolean
}

export interface SelectedFiltersModel {
    filters: string[];
    categories: CategoryModel[];
    startDate: string;
    endDate: string;
    distance: string;
    autocomplete: string
}
