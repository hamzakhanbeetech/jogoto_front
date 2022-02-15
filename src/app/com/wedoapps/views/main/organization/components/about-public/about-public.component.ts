import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {UserModel} from '../../../../../models';

@Component({
  selector: 'app-about-public',
  templateUrl: './about-public.component.html',
  styleUrls: ['./about-public.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPublicComponent implements OnInit, OnChanges {
  @Input()
  public organization: UserModel;

  public day: number = new Date().getDay();
  public businessHours: any[] = [
    {
      dayName: 'monday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
    {
      dayName: 'tuesday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
    {
      dayName: 'wednesday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
    {
      dayName: 'thursday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
    {
      dayName: 'friday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
    {
      dayName: 'saturday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
    {
      dayName: 'sunday',
      hours: [
        {
          start: '',
          end: ''
        },
        {
          start: '09:00',
          end: '17:00'
        },
      ],
    },
  ];
  public isOpen: boolean;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['organization'] && changes['organization'].currentValue) {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const organizationCurrentDayHours = this.organization.openTimes[this.day];

      if (this.organization.openTimes[this.day]) {
        if (this.organization.openTimes[this.day][0]) {
          const firstHalfStartHours = organizationCurrentDayHours[0].start.split(':');
          const firstHalfEndHours = organizationCurrentDayHours[0].end.split(':');

          if (hours > parseInt(firstHalfStartHours[0], 10) && hours < parseInt(firstHalfEndHours[0], 10)) {
            this.isOpen = true;
          } else if (hours >= parseInt(firstHalfStartHours[0], 10) && hours <= parseInt(firstHalfEndHours[0], 10)) {
            if (minutes > parseInt(firstHalfStartHours[1], 10) && minutes < parseInt(firstHalfEndHours[1], 10)) {
              this.isOpen = true;
            }
          }
        }

        if (this.organization.openTimes[this.day][1]) {
          const secondHalfStartHours = organizationCurrentDayHours[1].start.split(':');
          const secondHalfEndHours = organizationCurrentDayHours[1].end.split(':');

          if (hours > parseInt(secondHalfStartHours[0], 10) && hours < parseInt(secondHalfEndHours[0], 10)) {
            this.isOpen = true;
          } else if (hours >= parseInt(secondHalfStartHours[0], 10) && hours <= parseInt(secondHalfEndHours[0], 10)) {
            if (minutes > parseInt(secondHalfStartHours[1], 10) && minutes < parseInt(secondHalfEndHours[1], 10)) {
              this.isOpen = true;
            }
          }
        }
      }
    }

  }

  ngOnInit() {

  }

}
