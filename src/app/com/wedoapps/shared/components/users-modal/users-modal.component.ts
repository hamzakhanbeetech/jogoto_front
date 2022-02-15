import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserModel } from '../../../models/global.models';
import { MainService } from '../../../views/main/main.service';
import { SubjectsInteractionsService } from '../../../services/subjects-interactions.service';
import { Router } from '@angular/router';
import { AppService } from '../../../../../app.service';
import { CookieService } from 'ngx-cookie';
import { FormControl } from '@angular/forms';
import {UtilitesService} from "../../../services";

@Component({
  selector: 'app-users-modal',
  templateUrl: './users-modal.component.html',
  styleUrls: ['./users-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersModalComponent implements OnInit {
  public users: Array<UserModel>;
  public loadUsers: Array<UserModel> = [];
  public isAuthorized: boolean = false;
  private showMoreUsers: Array<UserModel> = [];
  private allUsers: Array<UserModel> = [];
  public noUser: boolean = false;
  private userToken: string = this._cookieService.get('user_token');
  private userId: string = this._cookieService.get('user_id');
  private load: boolean = true;
  public searchUser: FormControl = new FormControl();
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private _mainService: MainService,
    private _subjectsInteractionsService: SubjectsInteractionsService,
    private _router: Router,
    private _dialogRef: MatDialog,
    private _appService: AppService,
    private _cookieService: CookieService,
    private utilitesService: UtilitesService
  ) {
    this.isAuthorized = this._appService.getIsAuthorized();
  }

  ngOnInit() {
    this.users = this.data.users;
    for (let i = 0; i < this.users.length; i++) {
      i < 6 ? this.loadUsers.push(this.users[i]) : this.showMoreUsers.push(this.users[i]);
    }
    this._subjectsInteractionsService.authorizationState.subscribe(async (data) => {
      this.isAuthorized = await data.isAuthorized;
    });
    this.searchUserByName()
  }

  public seeMoreUsers(): void {
    this.allUsers = [...this.allUsers, ...this.showMoreUsers];
    let pushedList = [];
    pushedList = this.allUsers.splice(0, 6);
    this.loadUsers = [...this.loadUsers, ...pushedList];
    if (this.allUsers.length === 0) {
      this.load = false;
    }
  }

  public seeLessUsers(): void {
    this.load = true;
    this.loadUsers.length = 6;
  }

  public followUnfollow(user) {
    const followId = {
      id: user._id,
      u_id: this.userId,
      user_token: this.userToken
    };
    if (this.isAuthorized) {
      if (!user.im_follow) {
        this._mainService.followUser(followId).subscribe(res => {
          user.im_follow = true;
        });
      } else {
        this._mainService.unfolowUser(followId).subscribe(res => {
          user.im_follow = false;
        });
      }

    } else {
      const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
      this._router.navigate([localisedUrl]);
      this._dialogRef.closeAll();
    }
  }

  // search users on users list
  public searchUserByName(): void {


    let searchUsers: Array<UserModel> = [];
    let allUsers: Array<UserModel> = [];
    allUsers.push(...this.data.users);
    this.searchUser.valueChanges.subscribe((value) => {
      if (value) {
        searchUsers = allUsers.filter(user => {
          this.loadUsers = [];
          this.showMoreUsers = [];
          return user.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
        });
        if (searchUsers.length) {
          this.users = [];
          this.users.push(...searchUsers);
          searchUsers = [];
        } else {
          this.noUser = true;
        }
      } else {
        this.noUser = false;
        this.loadUsers = [];
        this.showMoreUsers = [];
        this.users = [];
        this.users.push(...allUsers);
      }
      for (let i = 0; i < this.users.length; i++) {
        i < 6 ? this.loadUsers.push(this.users[i]) : this.showMoreUsers.push(this.users[i]);
      }
    })




  }
}
