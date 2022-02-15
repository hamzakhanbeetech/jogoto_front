import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {CategoryModel, EventModel, ServerResponse, UserModel} from '../../../../models';
import {MainService} from '../../main.service';
import {Subject} from 'rxjs';
import {CookieService} from 'ngx-cookie';
import {SubjectsInteractionsService, UserService} from '../../../../services';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-interests',
    templateUrl: './interests.component.html',
    styleUrls: ['./interests.component.scss']
})
export class InterestsComponent implements OnInit, OnDestroy {
    public categoriesList: Array<CategoryModel> = [];
    private _categoriesForm: FormGroup;
    public userId = this._cookieService.get('user_id');
    public userCategories: Array<CategoryModel> = [];
    public activeCategoriesNames: Array<string> = [];
    public eventsByCategories: Array<EventModel> = [];
    public eventsCount: number;
    public loadingCategories: boolean = true;
    private _setValueComplete: boolean = false;
    private $unsubscribe: Subject<void> = new Subject<void>();

    constructor(private _mainService: MainService,
                private _cookieService: CookieService,
                private _subjectInteractions:SubjectsInteractionsService,
                private _fb: FormBuilder,
                private _userService: UserService) {
    }

    ngOnInit() {
        this._formBuilder();
        this._getAllCategoriesList();
        this.getUserData(this.userId);
        this.getUserInterestEvents();
        this._subjectInteractions.pageTags.next({title:`tags.interests_title`, desc:`tags.interests_desc`});
    }

    public getUserData(userId) {
        this._userService.getUserByUserId(userId).subscribe(res => {
            this.userCategories = res.data.categories;
            this._setSelectedCategories();
        }, err => {
            console.log(err);
        });
    }

    public getUserInterestEvents(): void {
        this._userService.getUserInterestEvents().subscribe(res => {
            this.eventsByCategories = res.data;
            this.eventsCount = res.info.eventsCount;
        }, err => {
            console.log(err);
        });
    }

    public updateUserInterests(categories): void {
        this._userService.updateUserInterests(categories).subscribe(data => {
            this.eventsByCategories = data.data;
            this.eventsCount = data.info.eventsCount;
        }, err => {
            console.log(err);
        });
    }

    private _getAllCategoriesList(): void {
        this._mainService.getCategoriesList()
            .pipe(
                takeUntil(this.$unsubscribe)
            )
            .subscribe((data: ServerResponse<Array<CategoryModel>>) => {
                this.categoriesList = data.data;
                this._categoriesForm.setControl('items', this._buildFormArray());
                this._setSelectedCategories();
                this._setValueComplete = true;
            });
    }

    private _setSelectedCategories(): void {
        this._setValueComplete = false;
        if (this.categoriesList && this.categoriesList.length > 0) {
            const values = [];
            const itemsArray = this._categoriesForm.get('items') as FormArray;
            for (let category = 0; category <= this.userCategories.length - 1; category++) {
                this.activeCategoriesNames.push(this.userCategories[category].name);
                for (let element = 0; element <= this.categoriesList.length - 1; element++) {
                    if (this.userCategories[category]._id === this.categoriesList[element]._id) {
                        values[element] = true;
                        itemsArray.controls[element].setValue(true);
                        itemsArray.value[element] = true;
                    }
                }
            }
            this.loadingCategories = false;
            this._setValueComplete = true;
        }
    }

    private _formBuilder(): void {
        this._categoriesForm = this._fb.group({
            items: this._fb.array([])
        });
    }

    public updateForm(category: CategoryModel, state: boolean) {
        let sendingArr = [];
        this.activeCategoriesNames = [];

        if (state) {
            this.userCategories.push(category);
        } else {
            this.userCategories = this.userCategories.filter(cat => cat._id !== category._id);
        }

        for (let cat of this.userCategories) {
            this.activeCategoriesNames.push(cat.name);
            sendingArr.push(cat._id);
        }

        this.updateUserInterests(sendingArr);
    }

    private _buildFormArray(): FormArray {
        const formArray: FormArray = this._fb.array([]) as FormArray;
        this.categoriesList.map((element: any, index) => {
            formArray.push(new FormControl(element.value));
        });
        return formArray;
    }

    get categoriesForm(): FormGroup {
        return this._categoriesForm;
    }

    get items(): FormArray {
        return this._categoriesForm.get('items') as FormArray;
    }

    ngOnDestroy() {
        this.$unsubscribe.next();
        this.$unsubscribe.complete();
        this.$unsubscribe.unsubscribe();
    }
}
