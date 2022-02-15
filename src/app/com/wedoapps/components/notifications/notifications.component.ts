import {Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, Renderer2} from '@angular/core';

import {INotification} from '../../models/notification.models';
import {Router} from '@angular/router';

interface IAcceptOrDecline {
  eventType: string;
  type: string;
  _id: string;
  userId?: string;
  needAcception?:boolean;
}


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit, OnChanges {
  @Input()
  public notifications: INotification[];
  @Input()
  public locale: string;
  @Input()
  public allCount: number;
  @Input()
  public isLoading: boolean = true;
  @Input()
  public skip: number;
  @Output()
  public seeMore: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  public removeNotification: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  public acceptOrDecline: EventEmitter<IAcceptOrDecline> = new EventEmitter<IAcceptOrDecline>();
  @Output()
  public markAll: EventEmitter<object> = new EventEmitter<object>();
  public isLoadMore: boolean = false;

  constructor(private _router: Router,
              private renderer2: Renderer2) {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const change in changes) {
      if (change === 'notifications') {
        this.isLoadMore = false;
      }
    }
  }

  ngOnInit() {
  }

  public seeMoreNotifications(): void {
    this.isLoadMore = !this.isLoadMore;
    this.seeMore.emit('more');
  }

  public removeNotificationById(notificationId: string, event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.removeNotification.emit(notificationId);
  }

  public acceptOrDeclineInvitation(event: any, type: string, id: string, eventType: string, userId:string, needAcception?:boolean): void {
    event.preventDefault();
    event.stopPropagation();
    this.acceptOrDecline.emit({
      eventType: eventType,
      type: type,
      _id: id,
        userId,
      needAcception
    });
  }

  public closeNotifications(): void {
    const items = document.getElementsByClassName('show');
    const expandedEl = document.querySelector('[aria-expanded]');

    Array.from(items).forEach((item) => {
      this.renderer2.removeClass(item, 'show');
      this.renderer2.removeClass(item, 'open');
      this.renderer2.setAttribute(expandedEl, 'aria-expanded', 'false');
    });
  }

}
