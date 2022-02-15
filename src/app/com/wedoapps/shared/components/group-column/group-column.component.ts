import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GroupModel} from '../../../views/main/initial/initial.models';
import {InitialService} from '../../../views/main/initial/initial.service';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie';
import {SubjectsInteractionsService, UserService, UtilitesService} from '../../../services';

@Component({
  selector: 'app-group-column',
  templateUrl: './group-column.component.html',
  styleUrls: ['./group-column.component.scss']
})
export class GroupColumnComponent implements OnInit {
  @Input('currentGroup') public currentGroup: GroupModel;
  @Input('isSearchPage') public isSearchPage: boolean;
  @Input('userIsLoggedIn') public userIsLoggedIn: boolean;
  @Output('changeGroups') public changeGroups = new EventEmitter<string>();
  public join: boolean;
  public groupMembers: number;
  public imJoined: boolean = false;
  public imCreator: boolean;
  public link: string;
  @Input('archiveGroup') public archiveGroup = false;
  @Input('blockGroup') public blockGroup = false;
  @Output() public removeGroup = new EventEmitter<any>();

  constructor(private _initialService: InitialService,
              private _route: Router,
              private _cookieService: CookieService,
              private _utilitesServiec: UtilitesService,
              private _usersServiec: UserService,
              private _subjectsInteractionsService: SubjectsInteractionsService) {
  }

  ngOnInit() {
    if (this.currentGroup) {
      this.link = this.currentGroup.viewType || this.archiveGroup ? `/group/${this.currentGroup._id}` : `/basic/create-group/preview/${this.currentGroup._id}`
      this.join = this.currentGroup.group_type !== 'open';
      this.imCreator =  this.currentGroup.creator && this.currentGroup.creator._id?this._cookieService.get('user_id') === this.currentGroup.creator._id :false;
      if (this.currentGroup.members) {
        this.groupMembers = this.currentGroup.members.length;
      }
      this.imJoined = this.currentGroup.imJoined;
    }
  }

  public joinGroup(group_id: string): void {
    if (this.userIsLoggedIn) {
      if (!this.imJoined) {
        this._initialService.joinToGroup(group_id).subscribe((data: any) => {
          this.imJoined = !this.imJoined;
          this.changeGroups.emit(group_id);
        }, (err) => {

        });
      } else {
        this._initialService.leaveFromGroup(group_id).subscribe((data) => {
          this.imJoined = !this.imJoined;
          this.changeGroups.emit(group_id);
          this._subjectsInteractionsService.followUnfollowGroup.next(false);
        });
      }
    } else {
      const localisedUrl = this._utilitesServiec.localizeRouter('auth/login');
      this._route.navigate([localisedUrl], {queryParams: {group: group_id}});
    }
  }

  public deleteGroup(): void {
    this.removeGroup.emit(
      {
        _id: this.currentGroup._id
      });
  }

  public unblockGroup(id){
      this._usersServiec.unblockData(id, 'group').subscribe(data=>{
      this._subjectsInteractionsService.unblockGroup.next(id)
    })
  }

}
