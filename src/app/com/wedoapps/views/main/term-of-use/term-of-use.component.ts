import {Component, OnInit} from '@angular/core';
import {SubjectsInteractionsService} from '../../../services';

@Component({
  selector: 'app-term-of-use',
  templateUrl: './term-of-use.component.html',
  styleUrls: ['./term-of-use.component.scss']
})
export class TermOfUseComponent implements OnInit {
  private lng: any;
  public pdfFile: any;

  constructor(private _subjectsInteractionsService: SubjectsInteractionsService) {
  }

  ngOnInit() {
    this._subjectsInteractionsService.getCurrentLang().subscribe((lang) => {
      this.lng = lang || 'en';
      this.pdfFile = this.lng === 'en' ? './assets/pdf/Jogoto-Terms-of-Servive.pdf' : './assets/pdf/Conditions_d_utilisation.pdf';
    });
    this._subjectsInteractionsService.pageTags.next({title:`tags.term_of_us_title`, desc:`tags.term_of_us_desc`});

  }
}
