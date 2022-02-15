import {Component, ElementRef, OnInit, ViewChild, OnDestroy, HostListener} from '@angular/core';

import {NoResultModel, UserModel} from '../../../../models/global.models';
import {TranslateService} from '@ngx-translate/core';
import {SubjectsInteractionsService, UserService} from '../../../../services';
import {ActivatedRoute} from '@angular/router';
import {debounceTime} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-followers-following',
  templateUrl: './followers-following.view.html',
  styleUrls: ['./followers-following.view.scss']
})
export class FollowersFollowingView implements OnInit, OnDestroy {
  @ViewChild('searchConnection', { static: true }) searchConnection: ElementRef;
  public searchText: string;
  public followersList: UserModel[] = [];
  public followingsList: UserModel[] = [];
  public allFollowersCount: number = 0;
  public allFollowingsCount: number = 0;
  public name: string = '';
  public profUserName: string = '';
  public surname: string = '';
  public activeTab: string = 'followers';
  public skip: number = 0;
  public limit: number = 6;
  public isLoading: boolean = true;
  public userId: string = '';
  public noResult: NoResultModel;
  private subscription: Subscription;
  private subscriptionRout: Subscription;
  private scroll: () => void = this.onScroll;

  @HostListener('window:scroll', ['$event'])
  public onWindowScroll() {
    const onBottom: boolean = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;

    if (onBottom && !this.isLoading && this.scroll) {
      this.skip += 6;
      this.isLoading = true;
      this.scroll();
    }
  }

  constructor(private _userService: UserService,
              private _subjectInteractions: SubjectsInteractionsService,
              private activeRoute: ActivatedRoute,
              private  translate: TranslateService) {
  }

  ngOnInit() {
    this.subscriptionRout = this.activeRoute.paramMap.subscribe(params => {
      this.userId = params.get('id');
      this.subscription = this.activeRoute.queryParams
        .subscribe(param => {
          if (param.type) {
            this.activeTab = param.type;
            if (this.activeTab === 'followings') {
              this.getUserFollowingsList(this.userId);
            } else {
              this.getUserFollowersList(this.userId);
            }
          } else {
            this.getUserFollowersList(this.userId);
          }
        });
    });
    this._subjectInteractions.pageTags.next({title:`tags.followers_title`, desc:`tags.followers_desc`});
  }

  public trackByFn(index, item) {
    return item.id; // or index
  }

  public getUserFollowersList(userId: string): void {
    this.isLoading = true;
    this._userService.getUserFollowersList(userId, this.searchText, this.skip, this.limit)
      .pipe(
        debounceTime(200)
      )
      .subscribe(res => {
        this.name = res.info.user_data.name;
        this.surname = res.info.user_data.surname;
        this.profUserName = res.info.user_data.name;
        if (res.info.array) {
          this.followersList = res.data;
          this.allFollowersCount = res.info.followers_count;
          this.allFollowingsCount = res.info.following_count;
        } else {
          this.noSearchResults(this.searchText);
          this.allFollowersCount = res.info.followers_count;
          this.allFollowingsCount = res.info.following_count;
        }
        this.isLoading = false;
      }, (error) => {
        console.log(error);
      });
  }

  public changeFollowingsCount(e): void {
    e.increment === true ? this.allFollowingsCount += 1 : this.allFollowingsCount -= 1;

    this.followingsList = this.followingsList.filter(following => following._id !== e.id);

    if (!this.followingsList.length) {
      this.isLoading = false;
    }
  }

  public getUserFollowingsList(userId): void {
    this.isLoading = true;
    this._userService.getUserFollowingsList(userId, this.searchText, this.skip, this.limit)
      .pipe(
        debounceTime(200)
      )
      .subscribe(res => {
          this.name = res.info.user_data.name;
        this.surname = res.info.user_data.surname;
        this.profUserName = res.info.user_data.name;
        if (res.info.array) {
          this.followingsList = res.data;
          this.allFollowersCount = res.info.followers_count;
          this.allFollowingsCount = res.info.following_count;
        } else {
          this.noSearchResults(this.searchText);
          this.allFollowersCount = res.info.followers_count;
          this.allFollowingsCount = res.info.following_count;
        }
        this.isLoading = false;
      }, error => {
        console.log(error);
      });
  }

  public changeTab(e): void {
    this.skip = 0;
    this.activeTab = e.id;
    this.scroll = this.onScroll;
    if (this.activeTab === 'followers') {
      this.followersList = [];
      this.getUserFollowersList(this.userId);
    } else {
      this.followingsList = [];
      this.getUserFollowingsList(this.userId);
    }
  }

  public takeInputLength(e): void {
    this.isLoading = true;
    this.searchText = e.target.value;
    this.skip = 0;

    let tabName;
    if (this.activeTab === 'followers') {
      tabName = 'followers';
      this.followersList = [];
    } else {
      this.followingsList = [];
      tabName = 'followings';
    }

    this._userService[`getUser${tabName.charAt(0).toUpperCase() + tabName.slice(1)}List`](this.userId, this.searchText, this.skip, this.limit)
      .pipe(
        debounceTime(200)
      )
      .subscribe(res => {
        if (res.info.array) {
          this[`${tabName}List`] = res.data;
        } else {
          this.noSearchResults(this.searchText);
        }

        this.allFollowersCount = res.info.followers_count;
        this.allFollowingsCount = res.info.following_count;
        this.isLoading = false;
      }, (error) => {
        console.log(error);
      });
  }

  public resetInputText(): void {
    this.searchConnection.nativeElement.value = '';
    this.searchText = '';
    this.skip = 0;
    if (this.activeTab === 'followers') {
      this.followersList = [];
      this.getUserFollowersList(this.userId);
    } else {
      this.followingsList = [];
      this.getUserFollowingsList(this.userId);
    }
  }

  public noSearchResults(text): void {
    if (text === undefined || text === '') {
      if (this.activeTab === 'followers') {
        this.translate.get('no-result.no_followers_show').subscribe((translated: string) => {
          this.noResult = {
            'icon': 'icon-user-follower',
            'text': translated
          };
        });
      } else {
        this.translate.get('no-result.no_followings_show').subscribe((translated: string) => {
          this.noResult = {
            'icon': 'icon-user-follower',
            'text': translated
          };
        });
      }

    } else {
      this.translate.get('no-result.no_results_for').subscribe((translated: string) => {
        this.noResult = {
          'icon': 'icon-user-follower',
          'text': `${translated}`
        };
      });
    }
  }

  private onScroll(): void {
    let tabName;
    if (this.activeTab === 'followers') {
      tabName = 'followers';
    } else {
      tabName = 'followings';
    }

    this._userService[`getUser${tabName.charAt(0).toUpperCase() + tabName.slice(1)}List`](this.userId, this.searchText, this.skip, this.limit)
      .pipe(
        debounceTime(200)
      )
      .subscribe(res => {
        if (res.info.array) {
          this[`${tabName}List`].push(...res.data);
          this.allFollowersCount = res.info.followers_count;
          this.allFollowingsCount = res.info.following_count;
        } else {
          this.allFollowersCount = res.info.followers_count;
          this.allFollowingsCount = res.info.following_count;
          this.scroll = null;
        }
        this.isLoading = false;
      }, (error) => {
        console.log(error);
      });
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscriptionRout.unsubscribe();
  }
}
