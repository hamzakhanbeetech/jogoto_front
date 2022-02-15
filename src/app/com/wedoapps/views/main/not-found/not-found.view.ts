import {Component, OnDestroy, OnInit} from '@angular/core';
import {UtilitesService} from "../../../services";
import {Router} from "@angular/router";

@Component({
  selector: 'not-found-view',
  templateUrl: './not-found.view.html',
  styleUrls: ['./not-found.view.scss']
})
export class NotFoundView implements OnInit, OnDestroy {

  constructor(private _utilitiesService:UtilitesService, private _router: Router) {
    const localisedRoute = this._utilitiesService.localizeRouter('/');
    history.pushState({page: 1}, "title 1", localisedRoute);
    window.onpopstate = (event)=> {
      history.go(1)
    }
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    window.onpopstate = () => {}
  }

}
