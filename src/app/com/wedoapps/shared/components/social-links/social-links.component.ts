import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

import {ISocialLinks} from '../../../models';

@Component({
  selector: 'app-social-links',
  templateUrl: './social-links.component.html',
  styleUrls: ['./social-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLinksComponent implements OnInit {
  @Input()
  public socialLinks: ISocialLinks[];

  constructor() {
  }

  ngOnInit() {}

}
