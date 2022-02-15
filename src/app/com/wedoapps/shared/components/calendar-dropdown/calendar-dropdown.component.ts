import {Router} from '@angular/router';
import {Component, Input, OnInit} from '@angular/core';
import {environment} from '../../../../../../environments/environment';
import {UtilitesService} from "../../../services";
import {SubjectsInteractionsService} from "../../../services";

@Component({
  selector: 'app-calendar-dropdown',
  templateUrl: './calendar-dropdown.component.html',
  styleUrls: ['./calendar-dropdown.component.scss']
})
export class CalendarDropdownComponent implements OnInit {

  @Input()
  public elementPosition: { top: number, left: number, right } = {top: 100, left: 100, right: null};

  @Input()
  public eventId: string = '';

  @Input()
  public showDeleteEvent: boolean = false;

  public windowLocation = window.location;
  public fbShare = `https://www.facebook.com/sharer/sharer.php?u=${environment.BASE_URL}event/${this.eventId}`;
  public inShare = `https://www.linkedin.com/shareArticle?mini=true&url=${environment.BASE_URL}event/${this.eventId}`;

  constructor(private router: Router, private utilitesService: UtilitesService, private subjectsInteractionsService: SubjectsInteractionsService ) {

  }

  ngOnInit() {
  }

  public goToEventPage(): void {
    setTimeout(() => {
      const localisedUrl = this.utilitesService.localizeRouter('/event/');
      this.router.navigate([localisedUrl, this.eventId]);
    });
  }

  public deleteEvent(){
    this.subjectsInteractionsService.deleteEvent.next(this.eventId)
  }

}
