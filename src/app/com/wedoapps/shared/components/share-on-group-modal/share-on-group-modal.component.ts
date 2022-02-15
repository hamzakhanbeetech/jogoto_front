import {
    Component,
    Inject,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    ViewChild,
    ElementRef,
    Renderer2,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {EventService} from '../../../views/main/event/event.service';
import {CookieService} from 'ngx-cookie';
import {ServerResponse, GroupModel} from '../../../models/global.models';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-share-on-group-modal',
    templateUrl: './share-on-group-modal.component.html',
    styleUrls: ['./share-on-group-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ShareOnGroupModalComponent implements OnInit, OnDestroy {
    public skip: number = 0;
    public limit: number = 5;
    public loading: boolean = false;
    public errorMessage: string = undefined;
    public thereIsOrNotResult: boolean = false;
    private _searchGroupForm: FormGroup;
    public groupsList: Array<GroupModel> = [];
    public userId: string = this._cookieService.get('user_id');
    private _appropriateUserInfo;
    public resetBtn: boolean = false;
    public groupCount: number;
    private _subscriptionAddEventToGroup: Subscription = new Subscription();
    public indexArray: Array<number> = [];
    @ViewChild('searchText', { static: true }) public searchText: ElementRef;

    constructor(public dialogRef: MatDialogRef<ShareOnGroupModalComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _eventService: EventService, private _cookieService: CookieService,
                private _fb: FormBuilder) {
    }

    ngOnInit() {
        this._formBuilder();
        this.getGroups();
        this._appropriateUserInfo = JSON.parse(localStorage.getItem('user_data'));
    }

    public onScroll(): void {
        if (this.groupCount - 5 > this.skip) {
            this.skip += 5;
            if (this._searchGroupForm.get('groupName').value) {
                this.onSearchGroup(this._searchGroupForm.get('groupName').value, true);
            } else {
                this.getGroups();
            }
        } else {
            this.skip = 0;
            this.groupsList = this.groupsList.slice(0, 5);
        }
    }

    private _formBuilder(): void {
        this._searchGroupForm = this._fb.group({
            groupName: [''],
        });
        this._searchGroupForm.get('groupName').valueChanges.subscribe((value: string) => {
            this.skip = 0;
            this.limit = 5;
            if (value && value.length !== 0) {
                this.onSearchGroup(value);
            } else {
                this.thereIsOrNotResult = false;
                this.skip = 0;
                this.getGroups(true);
            }
        });
    }

    public getGroups(searchevent?: boolean): void {
        this.loading = true;
        const location = JSON.parse(localStorage.getItem('user_data')).location.coordinates;
        const data = {
            u_id: this.userId,
            skip: this.skip,
            limit: this.limit,
            lat: location[0],
            lon: location[1],
            event_id: this.data
        };
        this._eventService.getSuggestedGroups(data).subscribe((data: ServerResponse<Array<GroupModel>>) => {
            this.loading = false;
          if (searchevent) {
                this.groupsList = data.data;
            } else {
                this.groupsList.push(...data.data);
            }
            this.groupsList.map((element) => {
                element['isIamMember'] = element.members.map(i => i._id).indexOf(this._appropriateUserInfo._id) > -1;
                return element;
            });
            this.checkGroupEvents()
        });
    }

    private addEventToGroup(group_id, index) {
        this._subscriptionAddEventToGroup = this._eventService
            .addEventToGroup(this.data, group_id, this.userId)
            .subscribe((data: ServerResponse<GroupModel>) => {
              window.scrollTo(0, 0);
            this.indexArray.push(index);
        }, err => {
            this.errorMessage = err.error.message;
        });
    }

    private checkGroupEvents(){
        let array  = [];
          for( let group of this.groupsList){
              let i = 0;
              for(let ev of group.events){
                  if(ev.event === this.data){
                      group.alreadyAdded = true;
                      break
                  }
              }
              array.push(group);
              i++
          }
        this.groupsList = array;
    }

    public reset(): void {
        this.searchText.nativeElement.value = null;
        this.thereIsOrNotResult = false;
        this.groupsList = [];
        this.getGroups();
        this.resetBtn = false;
    }

    public search() {
        if (this.searchText.nativeElement.value) {
            this.resetBtn = true;
        } else {
            this.resetBtn = false;
        }
    }

    public onClickFollowAndAddButton(group_id, index): void {
      this._eventService.followGroup(this.userId, group_id).subscribe((data) => {
          this.groupsList[index] = data.data;
            this.groupsList[index]['imJoined'] = this.groupsList[index].members.map(i => i._id).indexOf(this._appropriateUserInfo._id) > -1;
            this.addEventToGroup(group_id, index);
        }, err => {
            this.errorMessage = err.error.message;
        });
    }

    public onClickJoinAndAddButton(group_id, index): void {
        this._eventService.joinAndAddEventToGroup(this.userId, group_id, this.data).subscribe((data) => {
            window.scrollTo(0, 0);
            this.indexArray.push(index);
        }, err => {
            this.errorMessage = err.error.message;
        });
    }

    public onSearchGroup(valueOfSearchInput: string, scrollEvent?: boolean): void {
        this.loading = true;
        this._eventService.searchGroupByGroupName(valueOfSearchInput, this.userId, this.limit, this.skip, this.data).subscribe((data: ServerResponse<Array<GroupModel>>) => {
            this.loading = false;
            this.groupCount = data.info.count;
            if (data.info.count === 0) {
                this.thereIsOrNotResult = true;
            } else {
                this.thereIsOrNotResult = false;
                if (scrollEvent) {
                    this.groupsList.push(...data.data);
                } else {
                    this.groupsList = data.data;
                }
                this.groupsList.map((element) => {
                    element['isIamMember'] = element.members.map(i => i._id).indexOf(this._appropriateUserInfo._id) > -1;
                    return element;
                });
            }
            this.checkGroupEvents();
        }, error => {
            console.log(error);
        });
    }

    get searchGroupForm(): FormGroup {
        return this._searchGroupForm;
    }

    ngOnDestroy() {
        this._subscriptionAddEventToGroup.unsubscribe();
    }
}
