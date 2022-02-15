import {
  AfterViewInit,
  Component, EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import {CalendarEventModel} from '../../../models/global.models';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {CalendarDropdownService} from '../../../services/calendar-dropdown.service';
import {SubjectsInteractionsService} from '../../../services';
import frLocale from '@fullcalendar/core/locales/fr';
import enLocale from '@fullcalendar/core/locales/en-gb';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-calendar-module',
  templateUrl: './calendar-module.component.html',
  styleUrls: ['./calendar-module.component.scss']
})
export class CalendarModuleComponent implements OnInit, AfterViewInit, OnDestroy {
  public calendarPlugins;
  public subscription: Subscription = new Subscription();
  public events: CalendarEventModel;
  public dropdownElement;
  public locals = [frLocale, enLocale];
  public local: string;

  @Input('tab')
  public set tab(value) {
    if (value.tab) {
      this.events = value.events;
      setTimeout(() => {
        const a = window.scrollY;
        this.calendarComponent.getApi().render();
        this.checkBtns();
        window.scroll(0, a)
      }, 100);
    }
  };

  @Output('onBtnClick') btnClicked: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('calendarDropdown', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;
  @ViewChild('calendar', { static: true }) calendarComponent: FullCalendarComponent;

  @HostListener('document:click', ['$event.target'])
  onMouseEnter() {
    if (this.dropdownElement) {
      this.entry.clear();
    }
  }

  constructor(private calendarDropdownService: CalendarDropdownService,
              private renderer: Renderer2,
              private _subjects: SubjectsInteractionsService) {
    this.calendarPlugins = [dayGridPlugin]
  }

  ngOnInit() {
    this.checkLang();
  }

  ngAfterViewInit() {
    this.calendarComponent.getApi().render();
    this.getEvents()
  }

  ngOnDestroy() {
    if (!!this.entry) {
      this.entry.clear();
    }
    this.subscription.unsubscribe();
  }

  private checkBtns() {
    const prevBtn = document.querySelector('.fc-prev-button');
    const nextBtn = document.querySelector('.fc-next-button');
    prevBtn.addEventListener("click", (event) => {
      this.getEvents()
    });

    nextBtn.addEventListener("click", (event) => {
      this.getEvents()
    });
  }

  private getEvents() {
    const startDate = new Date(this.calendarComponent.getApi().view.activeStart).toISOString().toString().slice(0, 10);
    const endDate = new Date(this.calendarComponent.getApi().view.activeEnd).toISOString().toString().slice(0, 10);
    const param = `&start_date=${startDate}&end_date=${endDate}`;
    this.btnClicked.emit(param)
  }

  private checkLang() {
    this.subscription = this._subjects.getCurrentLang().subscribe(lang => {
      this.local = lang;
    })
  }


  public openDialog(e) {
    const parentNode: HTMLElement = document.querySelector('.fc-day-grid');
    const dropdownWidth = 215;
    const offsetOfElement = this.calendarDropdownService.getOffset(e.jsEvent, e.el, parentNode);
    const isOverlappingView = (offsetOfElement.left + dropdownWidth) > parentNode.offsetWidth;
    const isOverlappingTopView = (offsetOfElement.top + 100) > parentNode.offsetHeight;
    // added setTimeout for creating event dropdown after finishing all tasks of the stack
    setTimeout(() => {
      this.dropdownElement = this.calendarDropdownService.createAndGetCalendarDropdown(this.entry, {
        top: isOverlappingTopView ? offsetOfElement.top - 120 : offsetOfElement.top,
        left: isOverlappingView ? null : offsetOfElement.left,
        right: isOverlappingView ? 1 : null, // set 1 to right when element is overlapping the calendar content
        eventId: e.event && e.event.extendedProps && e.event.extendedProps.eventId ? e.event.extendedProps.eventId : ''
      });

      this.renderer.appendChild(parentNode, this.dropdownElement);
    });
  }
}
