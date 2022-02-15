import {Injectable} from '@angular/core';
import {Subject, Observable, BehaviorSubject, ReplaySubject} from 'rxjs';

import {EventModel, CheckInterestedOrNot, SendInfoToAlertMessage, UserModel, PosterModel} from '../models/global.models';
import {UsersFileModel} from '../views/main/basic/create-group/create-group.models';
import {TranslateService} from '@ngx-translate/core';
import {Poster} from '../views/main/basic/create-event/create-event.models';

@Injectable()
export class SubjectsInteractionsService {
  public pageTags: Subject<object> = new Subject<object>();
  public categoriesListFetched: Subject<void> = new Subject<void>();
  public eventCreateDuplicated: Subject<any> = new Subject<any>();
  public onSearch: Subject<boolean> = new Subject<boolean>();
  public filterWhen: Subject<object> = new Subject<object>();
  public filterWhere: Subject<object> = new Subject<object>();
  public filter: Subject<object> = new Subject<object>();
  public categoryFilter: Subject<object> = new Subject<object[]>();
  public categoryFilterCreateEvent: Subject<object> = new Subject<object[]>();
  public filterContentCreateEvent: Subject<object> = new Subject<object[]>();
  public inCreateEventPage: Subject<boolean> = new Subject<boolean>();
  public authorization: Subject<{ isAuthorized: boolean }> = new Subject<{ isAuthorized: boolean }>();
  public dynamicSearch: Subject<boolean> = new Subject<boolean>();
  public afterClickingInterestedOrNot: Subject<CheckInterestedOrNot> = new Subject<CheckInterestedOrNot>();
  public followUnfollowGroup: Subject<boolean> = new Subject<boolean>();
  public joinGroup: Subject<any> = new Subject<any>();
  public adminMemberGroup: Subject<any> = new Subject<any>();
  public errorSuccessMessag: Subject<SendInfoToAlertMessage> = new Subject<SendInfoToAlertMessage>();
  public changeImageSubject: Subject<any> = new Subject<any>();
  public checkedInterestsSubject: Subject<any> = new Subject<any>();
  public changeTab: Subject<boolean> = new Subject<boolean>();
  public changeSocialLinks: Subject<UserModel> = new Subject<UserModel>();
  public userPlace: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public searchFromFilter: Subject<boolean> = new Subject<boolean>();
  public createEventFilters: BehaviorSubject<any> = new BehaviorSubject<any>({filters: null, category: null});
  public mapDargedPlace: Subject<any> = new Subject<any>();
  public autocompleteClear: Subject<boolean> = new Subject<boolean>();
  public autocompleteChecked: Subject<boolean> = new Subject<boolean>();
  public socialLoginUser: Subject<any> = new Subject<any>();
  public deleteEvent: Subject<any> = new Subject<any>();
  public unblockEvent: Subject<any> = new Subject<any>();
  public unblockGroup: Subject<any> = new Subject<any>();

  public uploadedFile: BehaviorSubject<UsersFileModel> = new BehaviorSubject<UsersFileModel>(null);
  public searchedEvents: BehaviorSubject<EventModel[]> = new BehaviorSubject<EventModel[]>([]);
  public isAuthorizated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isShowMap: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public currentLang: BehaviorSubject<string> = new BehaviorSubject<string>(this.translateService.currentLang || localStorage.getItem('currentLanguage') || 'en');
  public searchInputValue: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public afterClickingInterestedOrNotState: Observable<CheckInterestedOrNot> = this.afterClickingInterestedOrNot.asObservable();
  public authorizationState: Observable<{ isAuthorized: boolean }> = this.authorization.asObservable();
  public $checkedInterestsSubject: Observable<any> = this.checkedInterestsSubject.asObservable();
  public searchedEventsState: Observable<EventModel[]> = this.searchedEvents.asObservable();
  public changeSocialLinks$: Observable<UserModel> = this.changeSocialLinks.asObservable();
  public uploadedFileState: Observable<UsersFileModel> = this.uploadedFile.asObservable();
  public $changeImageSubject: Observable<any> = this.changeImageSubject.asObservable();
  public categoryFiltetState: Observable<object> = this.categoryFilter.asObservable();
  public dynamicSearchState: Observable<boolean> = this.dynamicSearch.asObservable();
  public filterWhereState: Observable<object> = this.filterWhere.asObservable();
  public filterWhenState: Observable<object> = this.filterWhen.asObservable();
  public onSearchState: Observable<boolean> = this.onSearch.asObservable();
  public changeTab$: Observable<boolean> = this.changeTab.asObservable();
  public filterState: Observable<object> = this.filter.asObservable();
  public $userPlace: Observable<any> = this.userPlace.asObservable();
  public searchFromFilterState: Observable<boolean> = this.searchFromFilter.asObservable();
  public mapDargedPlaceState: Observable<any> = this.mapDargedPlace.asObservable();
  public autocompleteClearState: Observable<any> = this.autocompleteClear.asObservable();
  public autocompleteCheckedState: Observable<any> = this.autocompleteChecked.asObservable();
  public socialLoginUserState: Observable<any> = this.socialLoginUser.asObservable();
  public deleteEventState: Observable<any> = this.deleteEvent.asObservable();
  public unblockEventState: Observable<any> = this.unblockEvent.asObservable();
  public unblockGroupState: Observable<any> = this.unblockGroup.asObservable();


  constructor(private translateService:TranslateService) {
  }

  public checkUserState(): boolean {
    return this.isAuthorizated.getValue();
  }

  public changeUserState(state: boolean): void {
    this.isAuthorizated.next(state);
  }

  public changeMapState(state: boolean): void {
    this.isShowMap.next(state);
  }

  public getMapAsObservable(): Observable<boolean> {
    return this.isShowMap.asObservable();
  }

  public changeLang(lang: string): void {
    this.currentLang.next(lang);
  }

  public getCurrentLang(): Observable<string> {
    return this.currentLang.asObservable();
  }
}
