import { Component, OnInit } from '@angular/core';
import {SubjectsInteractionsService} from "../../../../services";

@Component({
  selector: 'app-about-organizer',
  templateUrl: './about-organizer.component.html',
  styleUrls: ['./about-organizer.component.scss']
})
export class AboutOrganizerComponent implements OnInit {

  constructor(private _subjectInteractions:SubjectsInteractionsService) { }

  ngOnInit() {
    this._subjectInteractions.pageTags.next({title:`tags.about_organizer_title`, desc:`tags.about_organizer_desc`});
  }

}
