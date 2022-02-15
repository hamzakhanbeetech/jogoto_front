import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-map-image',
  templateUrl: './map-image.component.html',
  styleUrls: ['./map-image.component.scss']
})
export class MapImageComponent implements OnInit, OnChanges {
  public mapUrl: string;
  public mapImage: string;
  private url: string = 'https://www.google.com/maps/';
  @Input('latLng') latLng: any;
  @Input('category') category: string;

  constructor() {
  }

  ngOnChanges() {
      this.mapUrl = `${this.url}search/?api=1&query=${this.latLng}`;
    if(this.latLng){
      this.mapImage = `${this.url}api/staticmap?center=${this.latLng}&markers=icon:https://jogoto.com:3000/map/${this.category}.png|${this.latLng}&zoom=12&size=400x160&key=AIzaSyBBQHvxlSFfD32yb1m5keOz_b8w7ZKyMmI`;
    }
  }

  ngOnInit() {
  }

}
