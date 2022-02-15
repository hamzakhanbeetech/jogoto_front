import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services';
import {CookieService} from 'ngx-cookie';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  public eventsCount: number;
  public joinCount: number;
  public viewsCount: number;

  constructor(private _userService: UserService,
              private _cookieService: CookieService) {
  }

  ngOnInit() {
    this._getUserPageStatistics();
  }

  private _getUserPageStatistics(): void {
    const id = this._cookieService.get('user_id');
    this._userService.getUserPageStatistics(id).subscribe(data => {
      this.eventsCount = data.data.eventsCount;
      this.joinCount = data.data.joinCount;
      this.viewsCount = data.data.viewsCount;
    }, err => {
      console.log(err);
    });
  }

}
