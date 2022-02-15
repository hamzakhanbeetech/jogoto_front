import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {UserModel} from '../../../../models/global.models';

@Component({
  selector: 'app-last-followers',
  templateUrl: './last-followers.component.html',
  styleUrls: ['./last-followers.component.scss'],
})
export class LastFollowersComponent implements OnInit {
  @Input()
  public userId: string;
  @Input()
  public userType: string;
  @Input()
  public followUsers: UserModel[];
  @Input()
  public isFollowerPage: boolean;

  constructor() { }

  ngOnInit() {
  }

}
