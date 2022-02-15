import { Component, OnInit } from '@angular/core';
import {SubjectsInteractionsService} from '../../../services';

@Component({
  selector: 'app-privancy-policy',
  templateUrl: './privancy-policy.component.html',
  styleUrls: ['./privancy-policy.component.scss']
})
export class PrivancyPolicyComponent implements OnInit {
  private lng: any;
  public pdfFile: any;
  constructor(private _subjectsInteractionsService: SubjectsInteractionsService) { }

  ngOnInit() {
    this._subjectsInteractionsService.getCurrentLang().subscribe((lang) => {
      this.lng = lang || 'en';
      this.pdfFile = this.lng === 'en' ? './assets/pdf/Privacy-Policy-en.pdf' : './assets/pdf/POLITIQUE_DE_CONFIDENTIALITÉ_DE_JOGOTO.pdf';
    });
    this._subjectsInteractionsService.pageTags.next({title:`tags.privacy_title`, desc:`tags.privacy_desc`});

  }
}
