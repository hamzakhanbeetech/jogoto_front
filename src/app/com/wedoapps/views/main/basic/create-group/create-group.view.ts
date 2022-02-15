import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie';
import {GroupModel, ServerResponse, UserModel} from '../../../../models/global.models';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {debounceTime, switchMap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Poster} from '../create-event/create-event.models';
import {CreateGroupService} from './create-group.service';
import {CreateGroupModel, UsersFileModel} from './create-group.models';
import {SubjectsInteractionsService, UtilitesService} from '../../../../services';
import {UploadService} from '../../../../services/upload.service';

@Component({
    selector: 'app-create-group',
    templateUrl: './create-group.view.html',
    styleUrls: ['./create-group.view.scss']
})
export class CreateGroupView implements OnInit, OnDestroy {
    public checkGroupType: Array<object>;
    public info: any;
    public isPublic: boolean = true;
    private groupId: string;
    public groupData: GroupModel;
    public titleErr: string;
    public userSearchField = new FormControl(null);
    public selectedUsers = [];
    private _groupForm: FormGroup;
    public _isEdit: boolean = false;
    private _file: UsersFileModel = {} as UsersFileModel;
    private _unsortedArr = [];
    public loading: boolean = false;
    public resetbtn: boolean = false;
    @ViewChild('searchValue', { static: true }) searchValue: ElementRef;
    public imageLoading: boolean = false;
    private imageData:Poster;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private isDefaultImage: boolean = true;

    constructor(private _translate: TranslateService,
                private _activatedRoute: ActivatedRoute,
                private _groupService: CreateGroupService,
                private _cookieService: CookieService,
                private _fb: FormBuilder,
                private _subjectInteractionService: SubjectsInteractionsService,
                private _utilitiesService:UtilitesService,
                private _uploadService:UploadService,
                private _router: Router) {
    }

    ngOnInit() {
        this._formBuilder();
        this._getQueryParam();
        this._translate.get(['create-group.open_group', 'create-group.open_group_desc',
            'create-group.closed_group', 'create-group.closed_group_desc', 'create-group.group_basic_information', 'create-group.group_basic_information_desc']).subscribe((translated: string) => {
            this.checkGroupType = [
                {
                    icon: 'icon-public-globe',
                    title: this._translate.instant('create-group.open_group'),
                    description: this._translate.instant('create-group.open_group_desc'),
                    value: 'public'
                },
                {
                    icon: 'icon-closed',
                    title: this._translate.instant('create-group.closed_group'),
                    description: this._translate.instant('create-group.closed_group_desc'),
                    value: 'private'
                }
            ];
            this.info = {
                title: this._translate.instant('create-group.group_basic_information'),
                description: this._translate.instant('create-group.group_basic_information_desc'),
            };
        });
    }

    public markControlAsTouched(control: AbstractControl) {
        control.markAsTouched();
    }

    public getInputValue(e) {
        if (this.searchValue.nativeElement.value) {
            this.resetbtn = true;
        } else {
            this.resetbtn = false;
        }
    }

    public resetSearch(): void {
        this.searchValue.nativeElement.value = '';
        this.resetbtn = false;
    }

    private _formBuilder(): void {
      const nonWhitespaceRegExp: RegExp = new RegExp('\\S');

        this._groupForm = this._fb.group({
            title: [null, [Validators.required, Validators.pattern(nonWhitespaceRegExp)]],
            description: [''],
            poster: [null],
            location: [null, [this._locationValidator, Validators.required]],
            visibility: [null, Validators.required]
        });
    }

    public handleCrop(data): void {
        const event:Poster = data.poster;
        if(data.isSave == 'save'){
            this.imageLoading = true;
            this._groupForm.get('poster').setValue(event);
            this.uploadImage(event);
        }else if(data.isSave == 'delete'){
            this.isDefaultImage = true;
            this._groupForm.get('poster').setValue(null);
        }
    }

    private uploadImage(poster:Poster) {
        this.imageData = poster;
        if (!poster.default_image) {
          const body  = {
            original: poster.original.data,
            cropped: poster.cropped.data,
            type: 'group'
          };
          this._uploadService.uploadImage(body).subscribe((data)=>{
            this.imageData.cropped.data = data.data.imageName;
            this.imageData.original.data = data.data.imageName;
            this._groupForm.get('poster').setValue(this.imageData);
            this.imageLoading = false;
          })
        }
    }

    public chooseGroupType(type: string): void {
        this.isPublic = type === 'public';
    }

    public handleTitleEvent(value: string): void {
        this._groupForm.get('title').setValue(value);
    }

    private _locationValidator(control: AbstractControl) {
        return (control.value && typeof control.value.latLng.lat == 'string') ? {invalidLocation: true} : null;
    }

    public getAutocomplete(event): void {
        this._groupForm.get('location').setValue(event);
    }

    public autocomplete = (text$: Observable<string>): Observable<Array<string>> =>
        text$.pipe(
            debounceTime(200),
            switchMap(term => {
                return this._groupService.searchUsers(term);
            })
        );

    public chooseUser(user): void {
        this._unsortedArr.push(user.item);
        if (this._unsortedArr.length > 0) {
            this.selectedUsers = this._getUnique(this._unsortedArr, '_id');
            this._unsortedArr = this._getUnique(this._unsortedArr, '_id');
        }
        user.preventDefault();
        this.userSearchField.reset();
    }

    private _getUnique(arr, comp): any {
        return arr.map(e => e[comp]).map((e, i, final) => final.indexOf(e) === i && i)
            .filter((e) => arr[e]).map(e => arr[e]);
    }


    public formatMatches = (value: any) => `${value.name} ${value.surname}` || '';

    public getFile(file: UsersFileModel) {
        this._file = file;
    }

    public deleteUser(i: number) {
        this.selectedUsers.splice(i, 1);
        this._unsortedArr.splice(i, 1);
    }

    private _getQueryParam(): void {
        this._activatedRoute.queryParams.subscribe((param) => {
            if (param.groupId) {
                this.groupId = param.groupId;
                this._isEdit = true;
                this._getGroup(this.groupId);
            }else{
                if(this._groupForm){
                    this._groupForm.patchValue({
                        visibility: 'public'
                    });
                }
            }
        });
    }

    private _getGroup(id: string) {
        const data = {
            u_id: this._cookieService.get('user_id'),
            id
        };
        this._groupService.getGroupById(data).subscribe((data: ServerResponse<GroupModel>) => {
            this.groupData = data.data;
            this.isDefaultImage = data.data.poster.default_image;

            this._groupForm.patchValue({
                description: data.data.description,
            });
            this.selectedUsers = data.data.members;
            this._unsortedArr = data.data.members;
            const groupType = data.data.group_type === 'open' ? 'public' : 'private';
            this._groupForm.patchValue({
                visibility: groupType
            });
            this._subjectInteractionService.eventCreateDuplicated.next(this.groupData);
        });
    }

    public onCreateGroup() {
        const groupType = this._groupForm.get('visibility').value == 'public' ? 'open' : 'closed';
        const sendingData: CreateGroupModel = {
            'name': this._groupForm.get('title').value.trim(),
            'description': this._groupForm.get('description').value.trim(),
            'group_type': groupType,
            'file_data': {
                'extname': this._file.extname || '',
                'data': this._file.data || '',
                'error': false
            },
            'location': {
                'lat': this._groupForm.get('location').value.latLng.lat,
                'lon': this._groupForm.get('location').value.latLng.lng,
            },
            'address': {
                'full': this._groupForm.get('location').value.autocomplete
            },
            'members': this.selectedUsers.map((user: UserModel) => user._id)
        };
        if(this._groupForm.get('poster').value){
            sendingData.poster = this._groupForm.get('poster').value;
            sendingData.default_image = this._groupForm.get('poster').value.default_image
        }else if (this._isEdit){
            sendingData.default_image = this.isDefaultImage;
        }else{
            sendingData.default_image = true
        }
        this.loading = true;
        this._groupService.createGroup(sendingData, this._isEdit, this.groupId).subscribe((data: ServerResponse<GroupModel>) => {
          const localisedUrl = this._utilitiesService.localizeRouter(`basic/create-group/preview/${data.data._id}`);
          this._router.navigate([localisedUrl]);
        }, (err) => {
            this.loading = false;
            if (err.error || err.error.error.status === 408) {
                this.titleErr = err.error.error.message;
            } else if (err.show) {
                this.titleErr = err.messageText;
            }
            console.log('ERROR WHILE CREATING Group');
        });
    }

    ngOnDestroy(){
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    get groupForm(): FormGroup {
        return this._groupForm;
    }
}
