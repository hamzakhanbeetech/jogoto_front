import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {CategoryModel, ServerResponse, UserModel} from '../../../models';
import {SubjectsInteractionsService, UserService, UtilitesService} from '../../../services';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.view.html',
  styleUrls: ['./user-profile.view.scss']
})
export class UserProfileView implements OnInit, OnDestroy {
  public user: UserModel;
  public followUsers: UserModel[] = [];
  public isFollow: boolean;
  public isFollowerPage: boolean;
  public isShowFollowingFullCount: boolean;
  public isShowFollowersFullCount: boolean;
  public catSubscription: Subscription;
  public categories: CategoryModel[] = [];
  public locale: string;
  private unsubscribe$: Subject<void> = new Subject<void>();
  private routerSubscription: Subscription;
  public userUnavailable:boolean = false;

  constructor(private _userService: UserService,
              private _activeRoute: ActivatedRoute,
              private _subjectInteractions: SubjectsInteractionsService,
              private _router: Router,
              private _utilitiesService: UtilitesService
              ) {
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user_data'));

    this.routerSubscription = this._activeRoute.paramMap.subscribe(param => {
      const id = param.get('id');
      if (this._subjectInteractions.checkUserState() && user) {
        if (id && id !== user._id) {
          this.isFollowerPage = true;
          this.getUserByUserId(id);
        } else {
          this.isFollowerPage = false;
          this.getUserByUserId(user._id);
        }
      } else {
        this.isFollowerPage = true;
        this.getUserByUserId(id);
      }
    });

    this.catSubscription = this._subjectInteractions.$checkedInterestsSubject
      .subscribe(res => {
        this.categories = res;
        const body = {
          categories: this.categories,
        };

        this._userService.updateUserCategories(body)
          .subscribe(res => {
            this.user.categories = res.data;
          });
      });

    this._subjectInteractions.getCurrentLang()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((lang)=>{
        this.locale = lang
    })
  }

  public getUserByUserId(userId): void {

    this._userService.getUserByUserId(userId)
      .subscribe((res: ServerResponse<UserModel>) => {
          if (res.data.register_type === 'individual') {
          this.user = res.data;
          this.followUsers = this.user.followUsers;
          this.isFollow = this.user.im_follow;
            if(this.isFollowerPage){
              this._subjectInteractions.pageTags.next({title:'tags.user_follow', desc:'tags.user_follow_desc', name:`${this.user.name} ${this.user.surname}`});
            }else{
              this._subjectInteractions.pageTags.next({title:`tags.user_title`, desc:`tags.user_desc`});
            }
          // this._subjectInteractions.selectedItems.next(this.user.categories);
        } else {
          this._router.navigateByUrl('/not-found/');
        }
      }, (err) => {
          if (err.status === 404) {
              const localisedRoute = this._utilitiesService.localizeRouter('/not-found');
              this._router.navigate([localisedRoute]);
          } else if ( err.status === 406) {
              this.userUnavailable = true;
          }
      });
  }

  public updateUserInfo(body): void {
    const userInfo = {
      ...body,
    };
    this._userService.updateUserInfo(userInfo)
      .subscribe(res => {
        this.user = res.data;
        localStorage.setItem('user_data', JSON.stringify(this.user));
      }, err => {
        console.log(err);
      });
  }

  public toggleFollow(id: string): void {
    if (!this.isFollow) {
      this._userService.followToUser(id)
        .subscribe(res => {
          const user = JSON.parse(localStorage.getItem('user_data'));
          this.followUsers.push(user);
          this.user.followers = res.data.followers_count;
          this.isFollow = res.data.im_follow;
        });
    } else {
      this._userService.unfollowFromUser(id)
        .subscribe(res => {
          const userId = JSON.parse(localStorage.getItem('user_data'))._id;
          this.followUsers = this.followUsers.filter(follower => follower._id !== userId);
          this.user.followers = res.data.followers_count;
          this.isFollow = res.data.im_follow;
        });
    }
  }

  public navigateToFollowerPage(pageName: string): void {
    const localisedUrl = this._utilitiesService.localizeRouter(`/basic/followers/${this.user._id}`);
    this._router.navigate([localisedUrl], {queryParams: {type: pageName}});
  }

  ngOnDestroy() {
    this.catSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
