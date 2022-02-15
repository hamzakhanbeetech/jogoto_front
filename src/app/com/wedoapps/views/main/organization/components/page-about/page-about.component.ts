import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

import {AddressModel} from '../../../../../models';


@Component({
  selector: 'app-page-about',
  templateUrl: './page-about.component.html',
  styleUrls: ['./page-about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAboutComponent implements OnInit, OnChanges {
  @Input()
  public address: AddressModel;
  @Input()
  public coordinates: number[] = [];
  @Input()
  public emails: string[];
  @Input()
  public phones: string[];
  @Input()
  public websiteUrl: string;

  public latLng: string;
  public mapUrl: string;

  private url: string = 'https://www.google.com/maps/';

  ngOnChanges(changes: SimpleChanges) {
    if (this.coordinates) {
      this.latLng = `${this.coordinates[1]},${this.coordinates[0]}`;
      this.mapUrl = `${this.url}search/?api=1&query=${this.latLng}`;
    }
    if(this.websiteUrl){
        this.websiteUrl = this.websiteUrl.startsWith('http')||this.websiteUrl.startsWith('https') ? this.websiteUrl : 'http://' + this.websiteUrl;
    }
  }

  constructor() {
  }

  ngOnInit() {
  }

}
