import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import {GoogleApiService, SubjectsInteractionsService} from '../../../../../services';
import {IPhone} from '../about-page-edit/about-page-edit.component';
import {InitialService} from '../../../initial/initial.service';
import {SearchService} from '../../../search/search.service';
import {EventModel, UserModel} from '../../../../../models';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-organization-tabs',
  templateUrl: './organization-tabs.component.html',
  styleUrls: ['./organization-tabs.component.scss']
})
export class OrganizationTabsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('search', { static: false })
  public search: any;
  @ViewChild('staticTabs', { static: true })
  private staticTabs: NgbTabset;

  @Input()
  public organization: UserModel;
  @Input()
  public isFollowerPage: boolean;
  @Input()
  public createdEvents: EventModel[];

  @Output()
  public organData: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  public addNewModeratorOutput: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output()
  public deleteModeratorOutput: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  public phonesData: EventEmitter<IPhone> = new EventEmitter<IPhone>();
  @Output()
  public activeTab: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  public businessData: EventEmitter<any> = new EventEmitter<any>();

  public isShowBusinessInfo: boolean;
  public newModerators: UserModel[] = [];
  public newModeratorsById: string[] = [];
  public isEditable: boolean = true;
  public cityData: any = {}; // get datas from google api for city location
  // public carensy = [
  //   {label: 'EUR'},
  //   {label: 'CHF'},
  // ];
  public data = [];
  public keyword = 'full_name';
  public count: number = 2;

  public isPreview: boolean = false;
  public isBusiness: boolean = false;

  public isAuthorized: boolean;
  public isLoading: boolean = true;

  public isShowFullNumber: boolean[] = [false, false, false, false];

  private unsubscribe$: Subject<void> = new Subject<void>();
  private _latLon: any;

  constructor(private _subjectsInteractionsService: SubjectsInteractionsService,
              private _userService: SearchService,
              private _initalService: InitialService,
              private _searchService: SearchService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'organization' && this.organization) {
        this.isBusiness = false;
        this.newModerators = [];
        this.isLoading = false;
        if (!this.isEditable) {
          this.isEditable = !this.isEditable;
        }

        this.isShowBusinessInfo = this.checkBusinessInfo();

        // this.setFormValues();
      }
    }
  }

  ngOnInit() {
    this._subjectsInteractionsService.changeTab$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.staticTabs.tabs[1].active = res;
      });

    this.isAuthorized = this._subjectsInteractionsService.checkUserState();
  }

  public changeTab(e: any): void {
    this.activeTab.emit(e.id);
  }

  public updateOrganizationInfo(body: any): void {
    this.organData.emit(body);
  }

  public updateBusinessInfo(body: any): void {
    this.businessData.emit(body);
  }

  public updatePhones(data: IPhone): void {
    this.phonesData.emit(data);
  }


// public resetForm(): void {
//   this.isEditable = true;
//
//   this.setFormValues();
// }
//
// public fieldIsExist(field): boolean {
//   return !isNull(field);
// }
//
// public editInfo(): void {
//   this.isEditable = !this.isEditable;
// }
//
// public addNewModerator(): void {
//   if (this.newModeratorsById.length > 0) {
//     this.isLoading = true;
//     this.addNewModeratorOutput.emit(this.newModeratorsById);
//   }
// }

// public add(event: UserModel): void {
//   if (this.newModerators.length > 0 && this.newModeratorsById.includes(event._id)) {
//     return;
//   } else {
//     this.newModerators.push(event);
//     this.newModeratorsById.push(event._id);
//   }
// }
//
// public deleteModerator(moderatorId: string): void {
//   this.deleteModeratorOutput.emit(moderatorId);
//   this.removeModeratorFromList(moderatorId);
// }
//
// public removeModeratorFromList(id: string) {
//   this.newModeratorsById = this.newModeratorsById.filter(modId => modId !== id);
//   this.newModerators = this.newModerators.filter(mod => mod._id !== id);
//   this.search.clear();

// public autocomplete = (text$: Observable<string>): Observable<Array<string>> =>
//   text$.pipe(
//     debounceTime(200),
//     switchMap(term => {
//       this._getLatLng(term);
//       this.cityData.name = term;
//       return this._googelService.searchAutocomplete(term);
//     })
//   );

// public handleAddressChange(event): void {
//   this.cityData = event.item;
//   this._getLatLng(this.cityData);
// }

  public searchModerators(q: any): void {

    this._userService.searchModerators(q, 0, 10, this.organization._id)
      .subscribe(res => {
          this.data = res.data.map(item => {
          Object.defineProperty(item, 'full_name', {
            writable: false,
            value: `${item.name} ${item.surname}`
          });
          return item;
        });
      }, (err) => {
        console.log(err);
      });
  }

//
// public showMoreModerators(): void {
//   if (this.count >= this.organization.moderators.length) {
//     this.count = 2;
//   } else {
//     this.count = this.organization.moderators.length;
//   }
// }

// public replaceText(e, formControlName: string): void {
//   const txt = e.target.value.replace(/[^\d]/g, '');
//   this.organizationForm.patchValue({
//     [formControlName]: txt,
//   });
// }

// public replaceEmptyFields(e, formControlName: string): void {
//   const pattern = /[a-zA-Z0-9]/gi;
//   const txt = e.target.value;
//
//   if (!txt.match(pattern) && formControlName !== 'full_address') {
//     this.organizationForm.patchValue({
//       [formControlName]: '',
//     });
//   } else if (!txt.match(pattern) && formControlName === 'full_address') {
//     this.organizationForm.get('address').patchValue({
//       [formControlName]: '',
//     });
//   }
// }

// private _getLatLng(placeName: string): void {
//   const geocoder = new google.maps.Geocoder;
//   geocoder.geocode({address: placeName}, (val) => {
//     if (val && val.length > 0) {
//       this._latLon = {
//         lat: val[0].geometry.location.lat(),
//         lon: val[0].geometry.location.lng()
//       };
//     }
//   });
// }

// private setFormValues(): void {
//   this.organizationForm.patchValue({
//     name: this.organization.name,
//     email: this.organization.email,
//     employees: this.organization.employees,
//     events_count_year: this.organization.events_count_year,
//     attendees: this.organization.attendees,
//     budget: this.organization.budget,
//     address: {
//       full_address: this.organization.address.full_address || ''
//     },
//   });
// }


  private checkBusinessInfo(): boolean {
    return this.organization.employees || this.organization.events_count_year || this.organization.events_count_year || this.organization.attendees || this.organization.budget;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
