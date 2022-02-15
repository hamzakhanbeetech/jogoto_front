import {Component, Input, OnInit} from '@angular/core';
import {GroupModel} from '../../../models/global.models';
import {UtilitesService} from '../../../services';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-about-group',
  templateUrl: './about-group.component.html',
  styleUrls: ['./about-group.component.scss']
})
export class AboutGroupComponent implements OnInit {
  @Input('groupData') public groupData: GroupModel;
  public description: string;
  public latLng: any;
  public mapUrl: string;
  public checkGroupState: boolean;
  public type: string;


  constructor(private utilitiesService: UtilitesService,
              private _translate: TranslateService) {
  }

  ngOnInit() {
    this.latLng = `${this.groupData.location[1]},${this.groupData.location[0]}`;
    this.mapUrl = `https://www.google.com/maps/search/?api=1&query=${this.latLng}`;
    this.description = this.utilitiesService.checkHashtags(this.groupData.description);
    this.checkGroupState = (this.groupData.imJoined && this.groupData.group_type === 'closed') || this.groupData.group_type === 'open';
  }

}
