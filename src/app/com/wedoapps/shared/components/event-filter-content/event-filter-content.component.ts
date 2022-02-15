import {ActivatedRoute, Router} from '@angular/router';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubjectsInteractionsService} from '../../../services/subjects-interactions.service';
import {MainService} from '../../../views/main/main.service';
import {EventModel, FiltersModel, ServerResponse} from '../../../models/global.models';
import {Subject} from 'rxjs';
import {FieldsOfSearching} from '../../../views/main/search/search.models';
import {FiltersService} from '../../../services/filters.service';
import {SidebarFilterService} from '../../../services/sidebar-filter.service';
import {first, takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {CategoryModel} from '../../../models';
import {UtilitesService} from "../../../services";

@Component({
  selector: 'app-event-filter-content',
  templateUrl: './event-filter-content.component.html',
  styleUrls: ['./event-filter-content.component.scss']
})
export class EventFilterContentComponent implements OnInit, OnDestroy {
  @Input()
  public saveState = false;
  @Input('isDynamicSearch')
  public _isDynamicSearch: boolean = false;

  @Input('isClosed')
  private set sendData(value) {
    if (value && !value.isClosed) {
        if (this._isDynamicSearch && value.isOk) {
          this._navToSearch();
      } else if (!this.saveState && value.isOk) {
        this.setFiltersForMobile();
        this._subjectInteractionService.searchFromFilter.next(true);
      }
      this._outputData(this._subjectInteractionService.filterContentCreateEvent);
    }
  }

  @Output()
  public onChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  public filterNames: Array<{ name: string }> = [];
  public selectedFilters: string[] = [];
  public isCheckAll: boolean = false;
  private _setValueComplete: boolean = false;
  private _searchingData: FieldsOfSearching = {} as FieldsOfSearching;
  // @Output() public onChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  private _windowWidth: boolean = window.innerWidth < 568;
  private _isInCreateEventPage: boolean = false;
  private $unsubscribe: Subject<void> = new Subject<void>();
  private otherLangFilters = [];

  constructor(
    private _fb: FormBuilder,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _mainService: MainService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _filtersService: FiltersService,
    private _translate: TranslateService,
    private utilitesService: UtilitesService
  ) {
    this._checkQueryParams();
  }

  public _filtersForm: FormGroup;

  // private _isDynamicSearch: boolean = false;

  get filtersForm(): FormGroup {
    return this._filtersForm;
  }

  private _checkAllControl: FormControl = new FormControl(false, {updateOn: 'submit'});

  get checkAllControl(): FormControl {
    return this._checkAllControl;
  }

  get itemsControl(): FormArray {
    let controls = this.filtersForm.get('items') as FormArray;
    return controls;
  }

  ngOnInit() {
    this._formBuilder();
    this._checkForMobile();
    this._getAllFiltersList();
    this._handleDynamicSearchEvent();
    this._handleOnSearchEvent();
    this._subscribeToEventCreatePageStatus();

    if (this.saveState) {
      SidebarFilterService.getFilterAsObservable()
        .pipe(first())
        .subscribe((data: any) => {
          if (!!data && data.filterNames) {
            this.selectedFilters = data.filterNames;
          }
        });

      SidebarFilterService.resetAction
        .pipe(takeUntil(this.$unsubscribe))
        .subscribe(() => {
          this.selectedFilters = [];
          this._setSelectedFilters();
        });
    }

  }

  public onClickCheckAll($event): void {
    this.isCheckAll = $event.checkboxValue;
    let itemsArray = this._filtersForm.get('items') as FormArray;

    itemsArray.controls.forEach((element: FormControl, index: number) => {
      element.setValue($event.checkboxValue, {emitEvent: false});
    });
  }

  ngOnDestroy() {
    this.setFiltersForMobile();
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  private setFiltersForMobile() {
    if (this._windowWidth) {
      this._outputData(this._subjectInteractionService.filterContentCreateEvent);
      this._filtersService.setFilters({
        filters: this._checkSelectedFilters(),
        checkAll: this._filtersForm.get('checkAll').value
      });
      if (this._isDynamicSearch) {
        this._navToSearch();
      }
    }
  }

  private _checkForMobile() {
    if (this._windowWidth) {
      const checkedFilters = this._filtersService.getSelectedFilters().filters;
      if (checkedFilters && !this._isDynamicSearch) {
        this.isCheckAll = checkedFilters.checkAll;
        this.selectedFilters = checkedFilters.filters || [];
      }
    }
  }

  private _checkQueryParams(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((data) => {
        this._searchingData = data as FieldsOfSearching;

        if (data && data.filter) {
          if (this.selectedFilters.join(',') != data.filter) {
            this.selectedFilters = data.filter.split(',');
          }
        } else {
          this.selectedFilters = [];
        }
        this._setSelectedFilters();

      });
  }

  private _subscribeToDuplicateEvent(): void {
    this._subjectInteractionService.createEventFilters
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((data) => {
          if(data.filters){
              setTimeout(()=>{
                  this._filtersForm.reset();
                  const selectedItem = [];
                  data.filters.map((filter) => {
                      selectedItem.push(filter);
                  });
                  let itemsArray = this._filtersForm.get('items') as FormArray;
                  this.filterNames.map((item, index: number) => {
                      selectedItem.map((choosenItem) => {
                          if (item.name == choosenItem ||item.name == choosenItem.name || (this._windowWidth &&
                              this.otherLangFilters[index] == choosenItem)
                          ) {
                              itemsArray.controls[index].setValue(true);
                          }
                      });
                  });
              },500)
          }
      });
  }

  private _getAllFiltersList(): void {
    this._mainService.getFiltersList().subscribe((data: ServerResponse<FiltersModel>) => {
      const filters = data.data;
      if (!this._windowWidth) {
        this.checkLang(filters);
      } else {
        this._translate.currentLang == 'en' ?
          this.otherLangFilters = filters['fr'] :
          this.otherLangFilters = filters['en'];
      }
      this.handleFilters(filters[this._translate.currentLang]);
      this._filtersForm.setControl('items', this._buildFormArray());
      this._subscribeToDuplicateEvent();
      this._setSelectedFilters();
      this._handleFiltersValueChanges();
    });
  }

  private checkLang(data) {
    this._translate.onLangChange
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe(lang => {
          this.handleFilters(data[lang.lang]);
      });
  }

  private handleFilters(filters) {
    this.filterNames = [];
    for (let filter of filters) {
        this.filterNames.push({
        name: filter
      });
    }
  }

  private _setSelectedFilters(): void {
    this._setValueComplete = false;
    if (this.filterNames && this.filterNames.length > 0) {
      let values: boolean[] = [];
      let itemsArray = this._filtersForm.get('items') as FormArray;
      this.filterNames.map((element, index) => {
        itemsArray.controls[index].setValue(false);
        values.push(false);
        this.selectedFilters.map((selectedElement, selectedIndex) => {
          if (element.name === selectedElement ||
            (this._windowWidth && this.otherLangFilters[index] == selectedElement)) {
            itemsArray.controls[index].setValue(true);
            values[index] = true;
          }
        });
      });
      this._checkIsCheckAll(values);
      this._setValueComplete = true;
    }
  }

  private _handleFiltersValueChanges(): void {
    this._filtersForm.get('items').valueChanges
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((data) => {
        this._checkIsCheckAll(data);
      });
  }

  private _checkIsCheckAll(data): void {
    let findex: number = data.indexOf(false);
    let notNull: number = data.indexOf(null);
    if ((findex == -1 || notNull == -1) && !this.isCheckAll) {
      this.isCheckAll = true;
    }
    if ((findex != -1 || notNull != -1) && this.isCheckAll) {
      this.isCheckAll = false;
    }
  }

  private _handleOnSearchEvent(): void {
    this._subjectInteractionService.onSearchState
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe(async (data) => {
        let isSearch: boolean = await data;
        this._outputData(this._subjectInteractionService.filter);
      });
  }

  private _outputData(subject): void {
    let selectedItems = this._checkSelectedFilters();
    subject.next({filter: selectedItems.toString()});
  }

  private _formBuilder(): void {
    this._filtersForm = this._fb.group({
      checkAll: new FormControl(false, {updateOn: 'submit'}),
      items: this._fb.array([]),
    });
    this._filtersForm.valueChanges
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe(() => {
        if (this.saveState) {
          SidebarFilterService.setFilterData({
            filterNames: this._checkSelectedFilters()
          });
        }
      });
  }

  private setData() {
    this._checkIsCheckAll(this._filtersForm.get('items').value);
    if (this._isInCreateEventPage) {
      this._outputData(this._subjectInteractionService.filterContentCreateEvent);
    }
    if (this._windowWidth) {
      localStorage.setItem('filters', JSON.stringify({filters: this._checkSelectedFilters(), checkAll: this.isCheckAll}));
    }
    if (this._setValueComplete && this._isDynamicSearch) {
      this._navToSearch();
    }

    if (this.saveState) {
      SidebarFilterService.setFilterData({
        filterNames: this._checkSelectedFilters()
      });
    }
  }

  private _buildFormArray(): FormArray {
    let formArray: FormArray = this._fb.array([]) as FormArray;
    this.filterNames.forEach((element: any, index) => {
      formArray.push(new FormControl(false));
    });
    return formArray;
  }

  private _checkSelectedFilters(): string[] {
    let itemsArray = this._filtersForm.get('items') as FormArray;
    let selectedItems: string[] = [];
    itemsArray.controls.forEach((element: FormControl, index: number) => {
      if (element.value) {
        selectedItems.push(this.filterNames[index]['name']);
      }
    });
    return selectedItems;
  }

  private _handleDynamicSearchEvent(): void {
    this._subjectInteractionService.dynamicSearchState
      .pipe(first())
      .subscribe(async (dynamicSearch: boolean) => {
        this._isDynamicSearch = dynamicSearch;
      });
  }

  private _subscribeToEventCreatePageStatus(): void {
    this._subjectInteractionService.inCreateEventPage
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe(status => {
          this._isInCreateEventPage = status;
      });
  }

  private _navToSearch(): void {
    let selectedFilters: string[] = this._checkSelectedFilters();
    let type = this._searchingData.type || 'event';
    if (type == 'event') {
        const searchInputValue: string = this._subjectInteractionService.searchInputValue.getValue();
      const localisedUrl = this.utilitesService.localizeRouter('/search');
      this._router.navigate([localisedUrl], {
        relativeTo: this._activatedRoute, queryParams: {
          type: 'event',
          distance: this._searchingData.distance || null,
          categories: this._searchingData.categories || null,
          start_date: this._searchingData.start_date || null,
          end_date: this._searchingData.end_date || null,
          query: searchInputValue || null,
          autocomplete: this._searchingData.autocomplete || null,
          filter: selectedFilters.join(',') || null,
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
  }
}
