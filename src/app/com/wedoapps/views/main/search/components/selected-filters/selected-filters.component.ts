import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router, ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';

import {MainService} from '../../../main.service';
import {CategoryModel, ServerResponse} from '../../../../../models/global.models';
import {FieldsOfSearching, SelectedFiltersModel} from '../../search.models';
import {SubjectsInteractionsService, UtilitesService} from '../../../../../services';

@Component({
  selector: 'app-selected-filters',
  templateUrl: './selected-filters.component.html',
  styleUrls: ['./selected-filters.component.scss']
})

export class SelectedFiltersComponent implements OnInit, OnDestroy {
  private _searchingData: FieldsOfSearching = {} as FieldsOfSearching;
  @Input('searchingData')
  set searchingData($event) {
    this._searchingData = $event;
    this._checkSelectedFilters();
    this._checkSelectedCategories();
  }
  @Output()
  public openFilter = new EventEmitter<string>();

  private _categoriesSubscription: Subscription = new Subscription();
  private _categories: CategoryModel[] = [];
  public selectedCategories: CategoryModel[] = [];
  public selectedFilters: SelectedFiltersModel = {
    filters: [],
    categories: [],
    startDate: '',
    endDate: '',
    distance: '',
    autocomplete: ''
  };

  public showDistanceCrossBtn: boolean;
  public showDateCrossBtn: boolean;
  public defaultDates: any;

  constructor(
    private _mainService: MainService,
    private _router: Router,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _activatedRoute: ActivatedRoute,
    private _utilitiesService: UtilitesService,
    private _datePipe: DatePipe
  ) {
  }

  ngOnInit() {
    this._checkSelectedFilters();
    this._getCategoriesList();
    // this.defaultDates = this._utilitiesService.getDefaultDates();
  }

  public onClickClearAll(): void {
    localStorage.removeItem('autocomplete');
    this._subjectInteractionService.autocompleteChecked.next(false);
    this._searchingData = {} as FieldsOfSearching;
    this._router.navigate([], {queryParams: {
      type: 'event',
      isSearched:true,
      // start_date: this.defaultDates.start_date,
      // end_date: this.defaultDates.end_date,
    }});
  }


  private _getCategoriesList(): void {
    this._categoriesSubscription = this._mainService.getCategoriesList().subscribe((categories: ServerResponse<CategoryModel[]>) => {
      this._categories = categories.data;
      this._checkSelectedCategories();
    });
  }

  private _checkSelectedCategories(): void {
    this.selectedCategories = [];
    if (this._searchingData && this._searchingData.categories) {
      const selectedCategoryIds: string[] = this._searchingData.categories.split(',');
      this._categories.map((category: CategoryModel, categoryIndex: number) => {
        selectedCategoryIds.map((selectedCategory: string, selectedCategoryIndex: number) => {
          if (category._id === selectedCategory) {
            this.selectedCategories.push(category);
          }
        });
      });
      this.selectedFilters.categories = this.selectedCategories;
    }
    return;
  }

  private _checkSelectedFilters(): void {
    if (this._searchingData) {
      this.selectedFilters.filters = [];
      this.selectedFilters = {} as SelectedFiltersModel;
      if (this._searchingData.filter) {
        const selectedFilters = this._searchingData.filter.split(',');
        this.selectedFilters.filters = selectedFilters;
      }
      if (this._searchingData.start_date) {
        this.showDateCrossBtn = true //this._datePipe.transform(this._searchingData.start_date,'yyyy-MM-dd') !== this._datePipe.transform(new Date(), 'yyyy-MM-dd');
        this.selectedFilters.startDate = this._searchingData.start_date;
      }
      // else {
      //   this.showDateCrossBtn = false;
      //   this.selectedFilters.startDate = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
      // }
      if (this._searchingData.end_date) {
        this.showDateCrossBtn = true // this._datePipe.transform(this._searchingData.end_date,'yyyy-MM-dd') !== this._datePipe.transform(new Date().setDate(new Date().getDate() + 10), 'yyyy-MM-dd');
        this.selectedFilters.endDate = this._searchingData.end_date;
      }
      // else {
      //   this.selectedFilters.endDate = this._datePipe.transform(new Date().setDate(new Date().getDate() + 10), 'yyyy-MM-dd');
      // }
      if (this._searchingData.autocomplete) {
        this.selectedFilters.autocomplete = this._searchingData.autocomplete;
      }
      if (this._searchingData.distance) {
        if (+this._searchingData.distance > 50) {
          this.selectedFilters.distance = '50';
        } else {
          this.selectedFilters.distance = this._searchingData.distance;
        }
        this.showDistanceCrossBtn = this._searchingData.distance !== '50';
      }
    } else {
      this.selectedFilters.filters = [];
    }
  }

  public onClickRemoveCategory(index: number, event): void {
    event.preventDefault();
    event.stopPropagation();
    const selectedCategoryIds: string[] = (this._searchingData.categories) ? this._searchingData.categories.split(',') : [];
    const ind: number = selectedCategoryIds.indexOf(selectedCategoryIds.filter((element) => element === this.selectedCategories[index]._id)[0]);
    selectedCategoryIds.splice(ind, 1);
    const params = {} as FieldsOfSearching;
    const localisedUrl = this._utilitiesService.localizeRouter(`/search`);
    this._router.navigate([localisedUrl], {
      relativeTo: this._activatedRoute, queryParams: {
        type: 'event',
        distance: this._searchingData.distance || null,
        categories: selectedCategoryIds.join(',') || null,
        start_date: this._searchingData.start_date || null,
        end_date: this._searchingData.end_date || null,
        query: this._searchingData.query || null,
        autocomplete: this._searchingData.autocomplete || null,
        filter: this._searchingData.filter || null,
        lat: this._searchingData.lat || null,
        lon: this._searchingData.lon || null,
            southWestLat:this._searchingData.southWestLat|| null,
            southWestLng:this._searchingData.southWestLng|| null,
            northEastLat:this._searchingData.northEastLat|| null,
            northEastLng:this._searchingData.northEastLng|| null,
            northWestLat:this._searchingData.northWestLat|| null,
            northWestLng:this._searchingData.northWestLng|| null,
            southEastLat:this._searchingData.southEastLat|| null,
            southEastLng:this._searchingData.southEastLng|| null,
            searchedText:this._searchingData.searchedText || null,
      }
    });
  }

  public onClickRemoveAutocomplete(event): void {
    event.preventDefault();
    event.stopPropagation();
    localStorage.removeItem('autocomplete');
    this._subjectInteractionService.autocompleteClear.next(true);
      this._subjectInteractionService.autocompleteChecked.next(false);
    const localisedUrl = this._utilitiesService.localizeRouter(`/search`);
    this._router.navigate([localisedUrl], {
      relativeTo: this._activatedRoute, queryParams: {
        type: 'event',
        categories: this._searchingData.categories || null,
        start_date: this._searchingData.start_date || null,
        end_date: this._searchingData.end_date || null,
        query: this._searchingData.query || null,
        autocomplete: '',
        filter: this._searchingData.filter || null,
        lat: null,
        lon: null,
            southWestLat:null,
            southWestLng:null,
            northEastLat:null,
            northEastLng: null,
            northWestLat: null,
            northWestLng: null,
            southEastLat:null,
            southEastLng:null,
            searchedText:this._searchingData.searchedText || null,
      }
    });
  }

  public onClickRemoveDistance(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showDistanceCrossBtn = false;
    this.selectedFilters.distance = '50';
    const localisedUrl = this._utilitiesService.localizeRouter(`/search`);
    this._router.navigate([localisedUrl], {
      relativeTo: this._activatedRoute, queryParams: {
        type: 'event',
        distance: '50' || null,
        categories: this._searchingData.categories || null,
        start_date: this._searchingData.start_date || null,
        end_date: this._searchingData.end_date || null,
        query: this._searchingData.query || null,
        autocomplete: this._searchingData.autocomplete || null,
        filter: this._searchingData.filter || null,
        lat: this._searchingData.lat || null,
        lon: this._searchingData.lon || null,
            southWestLat:this._searchingData.southWestLat|| null,
            southWestLng:this._searchingData.southWestLng|| null,
            northEastLat:this._searchingData.northEastLat|| null,
            northEastLng:this._searchingData.northEastLng|| null,
            northWestLat:this._searchingData.northWestLat|| null,
            northWestLng:this._searchingData.northWestLng|| null,
            southEastLat:this._searchingData.southEastLat|| null,
            southEastLng:this._searchingData.southEastLng|| null,
            searchedText:this._searchingData.searchedText || null,
      }
    });
  }

  public onClickRemoveFilter(index: number, event): void {
    event.preventDefault();
    event.stopPropagation();
    const selectedFiltersNames: string[] = (this._searchingData.filter) ? this._searchingData.filter.split(',') : [];
    const ind: number = selectedFiltersNames.indexOf(selectedFiltersNames.filter((element) => element === this.selectedFilters.filters[index])[0]);
    this.selectedFilters.filters.splice(ind, 1);
    const localisedUrl = this._utilitiesService.localizeRouter(`/search`);
    this._router.navigate([localisedUrl], {
      relativeTo: this._activatedRoute, queryParams: {
        type: 'event',
        distance: this._searchingData.distance || null,
        categories: this._searchingData.categories || null,
        start_date: this._searchingData.start_date || null,
        end_date: this._searchingData.end_date || null,
        query: this._searchingData.query || null,
        autocomplete: this._searchingData.autocomplete || null,
        filter: this.selectedFilters.filters.join(',') || null,
        lat: this._searchingData.lat || null,
        lon: this._searchingData.lon || null,
            southWestLat:this._searchingData.southWestLat|| null,
            southWestLng:this._searchingData.southWestLng|| null,
            northEastLat:this._searchingData.northEastLat|| null,
            northEastLng:this._searchingData.northEastLng|| null,
            northWestLat:this._searchingData.northWestLat|| null,
            northWestLng:this._searchingData.northWestLng|| null,
            southEastLat:this._searchingData.southEastLat|| null,
            southEastLng:this._searchingData.southEastLng|| null,
            searchedText:this._searchingData.searchedText || null,
      }
    });
  }

  public onClickRemoveDates(event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showDateCrossBtn = false;
    const localisedUrl = this._utilitiesService.localizeRouter(`/search`);
    this._router.navigate([localisedUrl], {
      relativeTo: this._activatedRoute, queryParams: {
        type: 'event',
        distance: this._searchingData.distance || null,
        categories: this._searchingData.categories || null,
        start_date: null, //this.defaultDates.start_date,
        end_date: null, //this.defaultDates.end_date,
        query: this._searchingData.query || null,
        autocomplete: this._searchingData.autocomplete || null,
        filter: this._searchingData.filter || null,
        lat: this._searchingData.lat || null,
        lon: this._searchingData.lon || null,
            southWestLat:this._searchingData.southWestLat|| null,
            southWestLng:this._searchingData.southWestLng|| null,
            northEastLat:this._searchingData.northEastLat|| null,
            northEastLng:this._searchingData.northEastLng|| null,
            northWestLat:this._searchingData.northWestLat|| null,
            northWestLng:this._searchingData.northWestLng|| null,
            southEastLat:this._searchingData.southEastLat|| null,
            southEastLng:this._searchingData.southEastLng|| null,
            searchedText:this._searchingData.searchedText || null,
      }
    });
  }

  ngOnDestroy() {
    this._categoriesSubscription.unsubscribe();
  }

}
