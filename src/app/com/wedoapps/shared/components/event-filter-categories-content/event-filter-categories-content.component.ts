import {ActivatedRoute, Router} from '@angular/router';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';

import {CategoryModel, EventModel, ServerResponse} from '../../../models';
import {FieldsOfSearching} from '../../../views/main/search/search.models';
import {MainService} from '../../../views/main/main.service';
import {FiltersService, SubjectsInteractionsService, UtilitesService} from '../../../services';
import {first, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SidebarFilterService} from '../../../services/sidebar-filter.service';

@Component({
  selector: 'app-event-filter-categories-content',
  templateUrl: './event-filter-categories-content.component.html',
  styleUrls: ['./event-filter-categories-content.component.scss']
})
export class EventFilterCategoriesContentComponent implements OnInit, OnDestroy {
  @Input()
  public saveState = false;
  @Input()
  public isUserPage = false;
  @Input('isDynamicSearch')
  public _isDynamicSearch = false;
  @Input('selectedCats')set
  setCats(data){
    this.selectedCategories = data.map(cat => cat._id)
  } ;

  @Input('isClosed')
  private set sendData(value) {
    if (value && !value.isClosed) {
      if (this._isDynamicSearch || this.isUserPage) {
        this._navToSearch();
      } else if (!this.saveState && value.isOk) {
        this.setCatsForMobile();
        this._subjectInteractionService.searchFromFilter.next(true);
      }
    }
  }

  @Input('checkAllFalse') public checkAllFalse: boolean;
  public categoriesList: Array<CategoryModel> = [];
  private _categoriesForm: FormGroup;
  public checkAll: boolean = false;
  public selectedCategories: string[] = [];
  public isCheckAllCategories: boolean = false;
  public isEmpty: boolean;
  public hover: boolean;
  private _setValueComplete: boolean = false;
  private _searchingData: FieldsOfSearching = {} as FieldsOfSearching;
  private _windowWidth: boolean = window.innerWidth < 568;
  private _isInCreateEventPage: boolean = false;
  private $unsubscribe: Subject<void> = new Subject<void>();
  private checkedCategories: any = [];
  private selectedItems: string[] = [];


  constructor(
    private _fb: FormBuilder,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _mainService: MainService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _filtersService: FiltersService,
    private utilitesService: UtilitesService
  ) {
    this._checkQueryParams();
  }

  ngOnInit() {
    this._formBuilder();
    this._getAllCategoriesList();
    this._handleOnSearchEvent();
    this._handleDynamicSearchEvent();
    this._subscribeToEventCreatePageStatus();
    this._checkForMobile();
    this._subscribeToDuplicateEvent();

    if (this.saveState) {
      SidebarFilterService.getFilterAsObservable()
        .pipe(first())
        .subscribe((data: any) => {
          if (!!data && data.categoriesId) {
            this.selectedCategories = data.categoriesId;
          }
        });

      SidebarFilterService.resetAction
        .pipe(takeUntil(this.$unsubscribe))
        .subscribe(() => {
          this.selectedCategories = [];
          this._setSelectedCategories();
        });
    }
  }

  public onClickCheckAll($event): void {
    this.isCheckAllCategories = $event.checkboxValue;
    let itemsArray = this._categoriesForm.get('items') as FormArray;
    itemsArray.controls.map((element: FormControl, index: number) => {
      element.setValue($event.checkboxValue, {emitEvent: false});
    });
  }

  private _checkForMobile() {
    if (this._windowWidth) {
      const checkedCats = this._filtersService.getSelectedFilters().categories;
      if (checkedCats && !this._isDynamicSearch) {
        this.checkAll = checkedCats.checkAll;
        this.selectedCategories = checkedCats.categories || [];
      }
    }
  }

  private _checkQueryParams(): void {
    this._activatedRoute.queryParams
      .pipe(
        takeUntil(this.$unsubscribe)
      )
      .subscribe((data) => {
        if (data && data.categories) {
          if (this.selectedCategories.join(',') != data.categories) {
            this.selectedCategories = data.categories.split(',');
          }
        } else {
          this.selectedCategories = [];
        }
        this._setSelectedCategories();
        this._searchingData = data as FieldsOfSearching;
      });
  }

  private _getAllCategoriesList(): void {
    this._mainService.getCategoriesList()
      .pipe(
        takeUntil(this.$unsubscribe)
      )
      .subscribe((data: ServerResponse<Array<CategoryModel>>) => {
        this.categoriesList = data.data;
        this.checkAll = true;
        this._categoriesForm.setControl('items', this._buildFormArray());
        this._setSelectedCategories();
        this._setValueComplete = true;
        this._subjectInteractionService.categoriesListFetched.next();
      });
  }

  private _handleOnSearchEvent(): void {
    this._subjectInteractionService.onSearchState
      .pipe(
        takeUntil(this.$unsubscribe)
      )
      .subscribe(async (data) => {
        let isSearch: boolean = await data;
        let selectedItems = this._checkSelectedCategories();
        this._subjectInteractionService.categoryFilter.next({categoryFilter: selectedItems.toString()});
      });
  }


  private _checkIsAllChecked(data): void {
    let findex: number = data.indexOf(false);
    if (findex == -1 && !this.isCheckAllCategories) {
      this.isCheckAllCategories = true;
    }
    if (findex != -1 && this.isCheckAllCategories) {
      this.isCheckAllCategories = false;
    }
  }

  private _setSelectedCategories(): void {
    this._setValueComplete = false;
    if (this.categoriesList && this.categoriesList.length > 0) {
      let values: boolean[] = [];
      let itemsArray = this._categoriesForm.get('items') as FormArray;
      this.categoriesList.map((element, index) => {
        itemsArray.controls[index].setValue(false);
        values.push(false);
        this.selectedCategories.map((selectedElement, selectedIndex) => {
          if (element._id === selectedElement) {
            values[index] = true;
            itemsArray.controls[index].setValue(true);
          }
        });
      });
      this._checkIsAllChecked(values);
      this._setValueComplete = true;
    }
  }

  private _subscribeToDuplicateEvent(): void {
    this._subjectInteractionService.createEventFilters
      .pipe(
        takeUntil(this.$unsubscribe)
      )
      .subscribe((data) => {
          if(data.category){
              setTimeout(()=>{
                  this._categoriesForm.reset();
                  let selectedItem: string[] = [];
                  if (data.category.length > 0) {
                      data.category.map((cat: CategoryModel) => {
                          selectedItem.push(cat._id);
                      });
                  }
                  let itemsArray = this._categoriesForm.get('items') as FormArray;
                  +this.categoriesList.map((item: CategoryModel, index: number) => {
                      selectedItem.map((choosenItem: string) => {
                          if (item._id == choosenItem) {
                              itemsArray.controls[index].setValue(true);
                          }
                      });
                  });
              },500)
          }
      });
  }

  private _checkSelectedCategories(): string[] {
    const itemsArray = this._categoriesForm.get('items') as FormArray;
    const selectedItems: string[] = [];
    this.checkedCategories = [];
    itemsArray.controls.filter((element: FormControl, index: number) => {
      if (element.value) {
        selectedItems.push(this.categoriesList[index]._id);
        this.checkedCategories.push(this.categoriesList[index]);
      }
    });

    this._filtersService.setCategories({
      categories: selectedItems,
      checkAll: this.checkAll
    });
    return selectedItems;
  }

  private _subscribeToEventCreatePageStatus(): void {
    this._subjectInteractionService.inCreateEventPage
      .pipe(
        takeUntil(this.$unsubscribe)
      )
      .subscribe(status => {
        this._isInCreateEventPage = status;
      });
  }

  private _formBuilder(): void {
    this._categoriesForm = this._fb.group({
      items: this._fb.array([])
    });
    this._categoriesForm.valueChanges
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((a) => {
        const selectedItems = this._checkSelectedCategories();
        const itemsArray = this._categoriesForm.get('items') as FormArray;
        this._checkIsAllChecked(this.categoriesForm.get('items').value);
        // if (this._setValueComplete && this._isDynamicSearch) {
        //   this._navToSearch();
        // }
        if (this._windowWidth) {
          localStorage.setItem('categories', JSON.stringify({
            categories: selectedItems,
            checkAll: this.isCheckAllCategories
          }));
        }

        //categories for create-event
        if (this.checkedCategories.length < 3) {
          this._subjectInteractionService.categoryFilterCreateEvent.next({
            categoryFilter: selectedItems.toString(),
            categories: this.checkedCategories
          });
        }

        if (selectedItems.length > 1 && this._isInCreateEventPage) {
          itemsArray.controls.filter((element: FormControl) => {
            if (!element.value) {
              element.disable({emitEvent: false});
            }
          });
        } else {
          itemsArray.controls.filter((element: FormControl) => {
            element.enable({emitEvent: false});
          });
        }
        if (this.saveState) {
          SidebarFilterService.setFilterData({
            categoriesId: selectedItems
          });
        }
      });
  }

  private _buildFormArray(): FormArray {
    let formArray: FormArray = this._fb.array([]) as FormArray;
    this.categoriesList.map((element: any, index) => {
      formArray.push(new FormControl(element.value));
    });
    return formArray;
  }

  private _handleDynamicSearchEvent(): void {
    this._subjectInteractionService.dynamicSearchState
      .pipe(
        takeUntil(this.$unsubscribe)
      )
      .subscribe(async (dynamicSearch: boolean) => {
        this._isDynamicSearch = dynamicSearch;
      });
  }

  public _navToSearch(): void {
    let selectedCategories: string[] = this._checkSelectedCategories();
    this.updateSubscriptions(selectedCategories);
    this.selectedItems = selectedCategories;
    if (this._isDynamicSearch) {
      let type = this._searchingData.type || 'event';
      if (type == 'event') {
        const searchInputValue = this._subjectInteractionService.searchInputValue.getValue();
        const localisedUrl = this.utilitesService.localizeRouter('/search/');
        this._router.navigate([localisedUrl], {
          relativeTo: this._activatedRoute, queryParams: {
            type: 'event',
            distance: this._searchingData.distance || null,
            categories: selectedCategories.join(',') || null,
            start_date: this._searchingData.start_date || null,
            end_date: this._searchingData.end_date || null,
            query: searchInputValue || null,
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
    }
  }

  public onMouseOver(e) {
    if(!this._windowWidth){
      this.hover = e;
    }
  }

  public onMouseLeave() {
    this.hover = null;
  }

  private updateSubscriptions(selectedItems) {
    if (selectedItems.length > 0) {
      this.isEmpty = true;
      this._subjectInteractionService.checkedInterestsSubject.next(selectedItems);
    } else if (this.isEmpty) {
      this._subjectInteractionService.checkedInterestsSubject.next([]);
      this.isEmpty = false;
    }

    //categories for create-event
    if (this.checkedCategories.length < 3) {
      this._subjectInteractionService.categoryFilterCreateEvent.next({
        categoryFilter: selectedItems.toString(),
        categories: this.checkedCategories
      });
    }

    if (this._windowWidth) {
      localStorage.setItem('categories', JSON.stringify({
        categories: selectedItems,
        checkAll: this.isCheckAllCategories
      }));

      this._filtersService.setCategories({
        categories: selectedItems,
        checkAll: this.checkAll
      });
    }

    if (this.isCheckAllCategories) {
      const categoriesId = [];

      this.categoriesList.forEach(el => {
        categoriesId.push(el._id);
      });

      this._subjectInteractionService.checkedInterestsSubject.next(categoriesId);

      if (this.saveState) {
        SidebarFilterService.setFilterData({
          categoriesId
        });
      }
    } else {
      if (this.saveState && !this._windowWidth) {
        this._subjectInteractionService.checkedInterestsSubject.next([]);
        SidebarFilterService.setFilterData({
          categoriesId: []
        });
      }
    }
  }

  private setCatsForMobile() {
    if (this._windowWidth) {
      this._filtersService.setCategories({
        categories: this._checkSelectedCategories(),
        checkAll: this.checkAll
      });
      this._navToSearch();
    }
  }

  get categoriesForm(): FormGroup {
    return this._categoriesForm;
  }

  get isInCreateEventPage(): boolean {
    return this._isInCreateEventPage;
  }

  get items(): FormArray {
    return this._categoriesForm.get('items') as FormArray;
  }

  ngOnDestroy() {
    this.setCatsForMobile();
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
    this.$unsubscribe.unsubscribe();
  }
}
