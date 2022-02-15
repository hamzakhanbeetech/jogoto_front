import {Component, OnInit, ViewChild} from '@angular/core';
import {PreviewService} from './preview.service';
import {GroupModel, NoResultModel} from '../../../../../models/global.models';
import {ActivatedRoute, Route, Router} from '@angular/router';
import {TabsetComponent} from 'ngx-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {CreateGroupService} from '../create-group.service';
import {UtilitesService} from "../../../../../services";

@Component({
  selector: 'preview-view',
  templateUrl: './preview.view.html',
  styleUrls: ['./preview.view.scss']
})
export class PreviewView implements OnInit {
  public previewGroupData: GroupModel;
  public eventData: boolean = false;
  public id: string;
  public noResult: NoResultModel;
  private moderatorsAdminsArray: Array<any> = [];
  private threeAdmins: Array<any> = [];
  private moreLessUsersArray: Array<any> = [];
  private arr: Array<any> = [];
  private arrUsers: Array<any> = [];
  private usersArray: Array<any> = [];
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;

  constructor(private _previewService: PreviewService,
              private activatedRoute: ActivatedRoute,
              private _router: Router,
              private _translate: TranslateService,
              private _createGroupService: CreateGroupService,
              private _utilitiesService: UtilitesService
  ) {
    this.id = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit() {
    this.getGroupPreview();
    this._translate.get('no-result.no_event_in_group').subscribe((translated: string) => {
      this.noResult = {
        'icon': 'icon-calendar',
        'text': translated
      };
    });
  }

  public showMoreLessAdmins(): void {
    let pushedList = [];

    if (this.arr.length > 0) {
      pushedList = this.arr.splice(0, 3);
      this.threeAdmins = [...this.threeAdmins, ...pushedList];
    } else {
      this.threeAdmins = [];
      this.arr = [...this.arr, ...this.moderatorsAdminsArray];
      pushedList = this.arr.splice(0, 3);
      this.threeAdmins = [...this.threeAdmins, ...pushedList];
    }
  }

  public showMoreLessUsers(): void {
    let pushedList = [];

    if (this.arrUsers.length > 0) {
      pushedList = this.arrUsers.splice(0, 6);
      this.moreLessUsersArray = [...this.moreLessUsersArray, ...pushedList];
    } else {
      this.moreLessUsersArray = [];
      this.arrUsers = [...this.arrUsers, ...this.usersArray];
      pushedList = this.arrUsers.splice(0, 6);
      this.moreLessUsersArray = [...this.moreLessUsersArray, ...pushedList];
    }
  }

  public getGroupPreview() {
    this._previewService.getGroupPreview(this.id).subscribe(async (data) => {
      this.previewGroupData = await data.data;
      this.moderatorsAdminsArray[0] = this.previewGroupData.creator;
      this.moderatorsAdminsArray.push(...this.previewGroupData.moderators, ...this.previewGroupData.admins);
      this.usersArray.push(...this.usersArray, ...this.previewGroupData.members);
      this.arr = [...this.arr, ...this.moderatorsAdminsArray];
      this.arrUsers = [...this.arrUsers, ...this.usersArray];
      this.showMoreLessAdmins();
      this.showMoreLessUsers();
      this.eventData = true;
    }, err => {
      console.log(err);
      if(err.status == 404){
        const localisedRoute = this._utilitiesService.localizeRouter('/not-found')
        this._router.navigate([localisedRoute])
      }
    });
  }

  public selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }

  public navigateCreatePage(): void {
    const localisedUrl = this._utilitiesService.localizeRouter('/basic/create-group');
    this._router.navigate([localisedUrl], {queryParams: {groupId: this.id}});
  }

  public publishGroup(id): void {
    this._createGroupService.publishGroup(id).subscribe(data => {
      const localisedUrl = this._utilitiesService.localizeRouter('group/');
      this._router.navigate([localisedUrl, id]);
    }, err => {
      console.log(err);
    });
  }
}
