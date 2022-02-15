import { Component, OnInit } from '@angular/core';
import { AboutService } from './about.service';
import {SubjectsInteractionsService} from "../../../services";


@Component({
    selector: 'app-about',
    templateUrl: './about.view.html',
    styleUrls: ['./about.view.scss']
})
export class AboutView implements OnInit {

    constructor(private _subjectInteractions: SubjectsInteractionsService) {
    }

    ngOnInit() {
      this._subjectInteractions.pageTags.next({title:`tags.about_title`, desc:`tags.about_desc`});
    }




}
