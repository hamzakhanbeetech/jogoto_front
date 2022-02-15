import {isNull} from 'util';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import {distinctUntilChanged} from 'rxjs/operators';
import frLocale from '@fullcalendar/core/locales/fr';
import enLocale from '@fullcalendar/core/locales/en-gb';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild, ViewContainerRef} from '@angular/core';


import {CalendarDropdownService} from '../../../../services/calendar-dropdown.service';
import {SidebarFilterService} from '../../../../services/sidebar-filter.service';
import {CreateEventService} from '../create-event/create-event.service';
import {CalendarSelectors} from '../../../../constants/calendar.constants';
import {SubjectsInteractionsService, UtilitesService} from '../../../../services';
import {EventInCalendar} from '../../../../models';
import * as moment from 'moment-timezone';
import {CookieService} from "ngx-cookie";


// This is for testing purposes. Please use your own API KEY. You can get it from https://developers.google.com/calendar/quickstart/js
const API_KEY = 'AIzaSyDwFc-wdOkYOEzmlN-d0CFme5upSKJYAP0';

// This is for testing purposes. Please use your own CLIENT ID. You can get it from https://developers.google.com/calendar/quickstart/js
const CLIENT_ID = '1097538590454-c06lp866krvugnrh3q0ht0s2hn04obr0.apps.googleusercontent.com';

const CALENDAR_ID = 'hamzakhan.beetech@gmail.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const win: any = window;
const now = new Date();

let calApiLoaded: boolean;



@Component({
  selector: 'calendar-view',
  templateUrl: 'calendar.view.html',
  styleUrls: ['calendar.view.scss']
})
export class CalendarView implements OnInit, OnDestroy, AfterViewInit {
  public calendarPlugins = [dayGridPlugin];
  public calendarSelectors = CalendarSelectors;
  public calendarPluginsWeek = [timeGridPlugin];
  public events: Array<EventInCalendar> = [];
  public dropdownElement;
  public locals = [frLocale, enLocale];
  public local: string;
  public fullCalendarOptions = {
    color: '#fff',
    timeFormat: {
      // month: 'short',
      // year: 'numeric',
      // day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };
  private zone =  moment.tz.guess();
  private activeTab: string = 'monthCalendarComponent';


  @ViewChild('calendarDropdown', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;

  @ViewChild('calendarWeek', { static: true })
  public weekCalendarComponent: FullCalendarComponent;
  @ViewChild('calendarDay', { static: true })
  public dayCalendarComponent: FullCalendarComponent;
  @ViewChild('calendarMonth', { static: true })
  public monthCalendarComponent: FullCalendarComponent;

  @HostListener('document:click', ['$event.target'])
  onMouseEnter() {
    if (!!this.entry) {
      this.entry.clear();
    }
  }
  initClient = () => {
    // alert("hi")
    win.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        calApiLoaded = true;
        // alert("hi")
        win.gapi.auth2.getAuthInstance().signIn();
        this.loadEvents(new Date, new Date);
    });
}

  constructor(private eventService: CreateEventService,
              private renderer: Renderer2,
              private calendarDropdownService: CalendarDropdownService,
              private _subjects: SubjectsInteractionsService,
              private _utilitiesService: UtilitesService,
              private _cookieService: CookieService) {
  }

  ngOnInit() {
    win.gapi.load('client:auth2', this.initClient)
    this.loadGoogleSDK()
    setTimeout( () => {
      this.loadEvents(new Date, new Date);

    }, 10000)
    SidebarFilterService.getFilterAsObservable()
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe((data) => {
        if (!isNull(data)) {
          this.getCalendarEvent(this.activeTab, this.getParamsForFilteringData(data));
        }
      });
    this.checkLang();
    this._subjects.pageTags.next({title:'tags.calendar_title', desc:'tags.calendar_desc'});
    this._subjects.deleteEventState.subscribe((val)=>{
      this.events = this.events.filter((item)=>{
        return item.eventId != val;
      });
      this.removeEvent(val)
    })
  }

  ngOnDestroy() {
    SidebarFilterService.setEmptyData();
    if (!!this.entry) {
      this.entry.clear();
    }
  }

  ngAfterViewInit() {

    const monthLink = document.getElementById('month-link');
    monthLink.addEventListener('click', () => {
      const api = this.monthCalendarComponent.getApi();
      api.render();
      this.activeTab = 'monthCalendarComponent';
      this.getCalendarEvent('monthCalendarComponent')
    });

    const weekLink = document.getElementById('week-link');
    weekLink.addEventListener('click', () => {
      const api = this.weekCalendarComponent.getApi();
      api.setOption('locales', this.locals);
      api.setOption('locale', this.local);
      api.render();
      this.activeTab = 'weekCalendarComponent';
      this.getCalendarEvent('weekCalendarComponent')
    });

    const dayLink = document.getElementById('day-link');
    dayLink.addEventListener('click', () => {
      const api = this.dayCalendarComponent.getApi();
      api.setOption('locales', this.locals);
      api.setOption('locale', this.local);
      api.render();
      this.activeTab = 'dayCalendarComponent';
      this.getCalendarEvent('dayCalendarComponent')
    });
  }

  btnListener(type){
    if(type === this.activeTab){
      this.getCalendarEvent(type)
    }
  }

  private getCalendarEvent(type, query = ''){
    if(this[type].getApi()){
      const startDate = new Date(this[type].getApi().view.activeStart).toISOString().toString().slice(0, 10);
      const endDate = new Date(this[type].getApi().view.activeEnd).toISOString().toString().slice(0, 10);
      const param = `&zone=${this.zone}&start_date=${startDate}&end_date=${endDate}${query}`;
      this.eventService.getMyEventByDateFilter({skip: 0, limit: 100}, param)
        .subscribe((events) => {
            this.filterEventsData(events.data);
        });
    }
  }

  private checkLang() {
    this._subjects.getCurrentLang().subscribe(lang => {
      this.local = lang;
    });
  }

  private removeEvent(id){
    this.eventService.removeCalendarEvent(id).subscribe((data)=>{
    }, err =>{
      console.log(err);
    })
  }

  public exportCalendar(event): void {
    this.eventService.exportCalendar()
      .subscribe((res) => {
        window.open(res.data.url, '_blank');

        event.preventDefault();
        event.stopPropagation();
        return false;
      });
  }

  public calendarEventClick(e, tabId: string): void {
    const dropdownWidth = 215;
    const parentNode: HTMLElement = document.querySelector(`${tabId}`);
    const offsetOfElement = this.calendarDropdownService.getOffset(e.jsEvent, e.el, parentNode);
    const isOverlappingView = (offsetOfElement.left + dropdownWidth) > parentNode.offsetWidth;
    const isOverlappingTopView = (offsetOfElement.top + 150) > parentNode.offsetHeight;
    // added setTimeout for creating event dropdown after finishing all tasks of the stack
    setTimeout(() => {
      this.dropdownElement = this.calendarDropdownService.createAndGetCalendarDropdown(this.entry, {
        top: isOverlappingTopView? offsetOfElement.top - 150:offsetOfElement.top ,
        left: isOverlappingView ? null : offsetOfElement.left,
        right: isOverlappingView ? 1 : null, // set 1 to right when element is overlapping the calendar content
        eventId: e.event && e.event.extendedProps && e.event.extendedProps.eventId ? e.event.extendedProps.eventId : '',
        showDeleteEvent: e.event && e.event.extendedProps && e.event.extendedProps.creatorId !== this._cookieService.get('user_id') ,
      });

      this.renderer.appendChild(parentNode, this.dropdownElement);
    });
  }

  private getParamsForFilteringData(filterObject): string {
    let params = '';

    if (!!filterObject.radius) {
      params += `&distance=${filterObject.radius}`;
    }

    if (!!filterObject.categoriesId && filterObject.categoriesId.length > 0) {
      params += `&categories=${filterObject.categoriesId.join()}`;
    }

    if (!!filterObject.filterNames && filterObject.filterNames.length > 0) {
      params += `&filters=${filterObject.filterNames.join()}`;
    }

    if (!!filterObject.latLng) {
      if (!!filterObject.latLng.lat) {
        params += `&lat=${filterObject.latLng.lat}`;
      }

      if (!!filterObject.latLng.lng) {
        params += `&lon=${filterObject.latLng.lng}`;
      }
    }

    return params;
  }

  public resetFilterData(): void {
    SidebarFilterService.setEmptyData();
    SidebarFilterService.resetAction.emit();
  }

  private filterEventsData(events) {
    this.events = [];
    const eventsLength = events.length;
    if (eventsLength === 0) {
      return false;
    }

    for (let i = 0; i < eventsLength; i += 1) {
      const dates = events[i].calendarDates;
      for (let j = 0; j < dates.length; j += 1) {
          let start = dates[j].start;
          let end = dates[j].end;
          if(dates[j].zone){
              start = this._utilitiesService.setTimeZone(dates[j], 'start', dates[j].zone);
              end = this._utilitiesService.setTimeZone(dates[j], 'end', dates[j].zone)
          }
          this.events.push(
          new EventInCalendar(
            false,
            events[i].name,
            start,
            end,
            !!events[i].category.length ? events[i].category[0].styleData.color : '',
            events[i]._id,
            events[i].organizer._id));
      }
    }
  }

  // Load the SDK asynchronously
  loadGoogleSDK(): void {
    ((d: any, s: any, id: any) => {
      let js: any;
      const fjs: any = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        win.onGoogleLoad();
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://apis.google.com/js/api.js?onload=onGoogleLoad';
      js.onload = 'onGoogleLoad';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'google-jssdk');
  }


  // Load events from Google Calendar between 2 dates
  loadEvents(first: Date, last: Date): void {
    // Only load events if the Google API finished loading
    if (calApiLoaded) {
      win.gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime'
      }).then((response: any) => {
        // alert("resp: "+response)
        console.log("resp: ",response)
        let event;
        const events = response.result.items;
        let end;
        // Process event list
        for (const value of events) {
          event = value;
          end = new Date(event.end.date || event.end.dateTime);

        }
        this.addEvent();
      }).catch(err => console.log("err: ",err));
    }
  }

  addEvent(){
    var event = {
      'summary': 'Google I/O 2015',
      'location': '800 Howard St., San Francisco, CA 94103',
      'description': 'A chance to hear more about Google\'s developer products.',
      'start': {
        'dateTime': '2015-05-28T09:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': '2015-05-28T17:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
      },
      'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=2'
      ],
      'attendees': [
        {'email': 'lpage@example.com'},
        {'email': 'sbrin@example.com'}
      ],
      'reminders': {
        'useDefault': false,
        'overrides': [
          {'method': 'email', 'minutes': 24 * 60},
          {'method': 'popup', 'minutes': 10}
        ]
      }
    };

    var request = win.gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });

    request.execute(function(event) {
      console.log('Event created: ' , event.htmlLink);
    });


  }

}
