import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {CategoryModel, EventModel, ServerResponse, UserModel} from '../../../../../models/global.models';
import {DataShareService, SubjectsInteractionsService, UserService, UtilitesService} from '../../../../../services';
import {AppService} from '../../../../../../../app.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {IPhone} from '../about-page-edit/about-page-edit.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {
  public organization: UserModel;
  public isFollowerPage: boolean;
  public isFollow: boolean;
  public categories: CategoryModel[];
  public createdEvents: EventModel[] = [];
  public activeTab: string = '';
  public locale: string;
  public organUnavailable: boolean = false;

  private skip: number = 0;
  private limit: number = 6;
  private isLoading: boolean;

  private unsubscribe$: Subject<void> = new Subject<void>();

  @HostListener('window:scroll', ['$event'])
  public onWindowScroll() {
    const onBottom: boolean = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;

    if (onBottom && this.activeTab === 'activity' && this.isLoading) {
      this.loadMoreCreatedEvent();
    }
  }

  constructor(private _userService: UserService,
              private _dataShareService: DataShareService,
              private _activeRoute: ActivatedRoute,
              private _appService: AppService,
              private _subjectInteractions: SubjectsInteractionsService,
              private _router: Router,
              private _utilitesServiec: UtilitesService
  ) {
  }

  ngOnInit() {
    const organ = JSON.parse(localStorage.getItem('user_data'));

    this._activeRoute.paramMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(param => {
        const id = param.get('id');
        if (this._subjectInteractions.checkUserState() && organ) {
          if (id && id !== organ._id) {
            this.isFollowerPage = true;
            this.getUserByUserId(id);
          } else {
            this.isFollowerPage = false;
            this.getUserByUserId(organ._id);
          }
        } else {
          this.isFollowerPage = true;
          this.getUserByUserId(id);
        }
      });

    // this._subjectInteractions.$checkedInterestsSubject
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(res => {
    //     this.categories = res;
    //     const body = {
    //       categories: this.categories,
    //     };
    //
    //     this._userService.updateUserInfo(body)
    //       .subscribe(res => {
    //         this.organization = res.data;
    //       });
    //   });

    this._subjectInteractions.changeSocialLinks$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.organization = res;
      });

      this._subjectInteractions.getCurrentLang()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((lang)=>{
              this.locale = lang
          })
  }

  public toggleFollow(id: string): void {
    const user = JSON.parse(localStorage.getItem('user_data'));
    if (!this.isFollow) {
      this._userService.followToUser(id)
        .subscribe(res => {
          this.organization.followUsers.push(user);
          this.organization.followers = res.data.followers_count;
          this.isFollow = res.data.im_follow;
        });
    } else {
      this._userService.unfollowFromUser(id)
        .subscribe(res => {
          this.organization.followers = res.data.followers_count;
          this.organization.followUsers = this.organization.followUsers
            .filter(data => data._id !== user._id);
          this.isFollow = res.data.im_follow;
        });
    }

  }

  public activateAboutUsTab(): void {
    this._subjectInteractions.changeTab.next(true);
  }

  public updateOrganizationInfo(body): void {
      this._userService.updateProfUserInfo(body)
      .subscribe(res => {
          this.organization = res.data;
      });
  }

  public updateBusinessInfo(body):void {
    this._userService.updateBusinessData(body)
      .subscribe(res => {
        this.organization = res.data;
      });
  }

  public updatePhones(data: IPhone): void {
    const body: IPhone = data;

    this._userService.updateProfUserPhone(body)
      .subscribe(res => {
        this.organization = res.data;
      }, err => {
        console.log(err);
      });
  }

  public addNewModerator(event): void {
    const body = {
      moderators: [
        ...event,
      ]
    };
    this._userService.addNewModerator(body)
      .subscribe(res => {
        this.organization = res.data;
      });
  }

  public deleteModerator(e): void {
    this._userService.deleteModerator(e)
      .subscribe(res => {
        this.organization = res.data;
      }, (err) => {
        console.log(err);
      });
  }

  public navigateToFollowerPage(pageName: string): void {
    const localisedUrl = this._utilitesServiec.localizeRouter(`/basic/followers/${this.organization._id}`);
    this._router.navigate([localisedUrl], {queryParams: {type: pageName}});
  }

  public changeActiveTab(value: string): void {
    this.activeTab = value;
  }

  private getUserByUserId(userId): void {
    this._userService.getUserByUserId(userId)
      .subscribe((res: ServerResponse<UserModel>) => {
        if (res.data.register_type !== 'individual') {
          this.organization = res.data;
          this._dataShareService.userCategories = res.data.categories.map(item => item._id);
          this.isFollow = this.organization.im_follow;
          if(this.isFollowerPage){
            this._subjectInteractions.pageTags.next({title:'tags.user_follow', desc:'tags.user_follow_desc', name:`${this.organization.name}`});
          }else{
            this._subjectInteractions.pageTags.next({title:`tags.user_title`, desc:`tags.user_desc`});
          }
          this.getCreatedEvents();
        } else {
            const localisedRoute = this._utilitesServiec.localizeRouter('/not-found');
            this._router.navigate([localisedRoute]);
        }
      }, (err) => {
          if (err.status === 404) {
              const localisedRoute = this._utilitesServiec.localizeRouter('/not-found');
              this._router.navigate([localisedRoute]);
          } else if ( err.status === 406) {
              this.organUnavailable = true;
          }
        console.log(err);
      });
  }

  private getCreatedEvents(): void {
    this._userService.getCreatedEvents(this.limit, this.skip, this.organization._id)
      .subscribe(res => {
        this.createdEvents = res.data;

        if (res.data.length === 6) {
          this.isLoading = !this.isLoading;
        }

      });
  }

  private loadMoreCreatedEvent(): void {
    this.isLoading = !this.isLoading;
    this.skip += 6;

    this._userService.getCreatedEvents(this.limit, this.skip, this.organization._id)
      .subscribe(res => {

        if (res.data.length === 6) {
          this.isLoading = !this.isLoading;
        }

        this.createdEvents.push(...res.data);
        this.createdEvents = [...this.createdEvents];
      }, err => {
        console.log(err);
        this.isLoading = !this.isLoading;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
