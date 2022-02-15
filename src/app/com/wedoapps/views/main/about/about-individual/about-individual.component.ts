import { Component, OnInit } from '@angular/core';
import {SubjectsInteractionsService} from "../../../../services";

@Component({
  selector: 'app-about-individual',
  templateUrl: './about-individual.component.html',
  styleUrls: ['./about-individual.component.scss']
})
export class AboutIndividualComponent implements OnInit {

  constructor(private _subjectInteractions:SubjectsInteractionsService) { }

  ngOnInit() {
    this._subjectInteractions.pageTags.next({title:`tags.about_individual_title`, desc:`tags.about_individual_desc`});
  }

}
