import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-block-title-see-more',
  templateUrl: './block-title-see-more.component.html',
  styleUrls: ['./block-title-see-more.component.scss']
})
export class BlockTitleSeeMoreComponent implements OnInit {
  @Input('title') public title: string;
  @Input('link') public link: string;
  @Input('queryParams') public queryParams = {};

  constructor(private _router: Router) {
  }

  ngOnInit() {
  }


}
