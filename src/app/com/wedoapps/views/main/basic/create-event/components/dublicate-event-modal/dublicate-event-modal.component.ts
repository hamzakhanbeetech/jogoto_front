import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CreateEventService} from '../../create-event.service';
import {EventModel, ServerResponse} from '../../../../../..//models/global.models';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {UtilitesService} from "../../../../../../services";

@Component({
  selector: 'app-dublicate-event-modal',
  templateUrl: './dublicate-event-modal.component.html',
  styleUrls: ['./dublicate-event-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DublicateEventModalComponent implements OnInit {
  public queryControl = new FormControl();
  private _allEvents: EventModel[] = [];
  private _skip: number = 0;
  private _count: number = 5;
  private _skipWithSearchQuerry: number = 0;
  private _countWithSearchQuerry: number = 5;
  private _pendingForEvents: boolean = false;
  public loadMore: boolean = true;
  public resetBtn: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<DublicateEventModalComponent>,
    private _createEventService: CreateEventService,
    private _router: Router,
    private _utilitiesService: UtilitesService
  ) {
  }

  ngOnInit() {
    this._getMyEvents();
    this._subscribeToQueryChanges();

  }

  private _subscribeToQueryChanges(): void {
    this.queryControl.valueChanges.subscribe((value: string) => {
      if (value === '') {
        this._skip = 0;
        this._getMyEvents(true);
        this.resetBtn = false;
      } else {
        this._skipWithSearchQuerry = 0;
        this.resetBtn = true;
        this._getMyEventByQuerry(value);
      }
    });
  }

  private _getMyEvents(clear?: boolean): void {
    this._pendingForEvents = true;
    this._createEventService.getMyEvents({limit: this._count, skip: this._skip}, 'duplicate').subscribe(
      (response: ServerResponse<any>) => {

        if (response.data.length === 5) {
          this.loadMore = true;
        } else {
          this.loadMore = false;
        }
        if (clear) {
          this._allEvents = response.data;
        } else {
          this._allEvents.push(...response.data);
        }
        this._pendingForEvents = false;
      },
      (error) => {
        this._pendingForEvents = false;
        console.log(error);

      });
  }

  private _getMyEventByQuerry(query: string, scrollEvent?: boolean): void {
    this._createEventService.getMyEventByQuerry({
      limit: this._countWithSearchQuerry,
      skip: this._skipWithSearchQuerry
    }, query, 'duplicate').subscribe(
      (response: ServerResponse<any>) => {

        if (scrollEvent) {
          this._allEvents.push(...response.data);
        } else {
          this._allEvents = response.data;
        }
        if (response.data.length === 5) {
          this.loadMore = true;
        } else {
          this.loadMore = false;
        }
        this._pendingForEvents = false;
      },
      (error) => {
        this._pendingForEvents = false;
        console.log(error);
      });
  }

  public updateList(): void {
    if (this.queryControl.value) {
      this._skipWithSearchQuerry += 5;
      this._getMyEventByQuerry(this.queryControl.value, true);
    } else {
      this._skip += 5;
      this._getMyEvents();
    }
  }

  get pendingForEvents(): boolean {
    return this._pendingForEvents;
  }

  get allEvents(): EventModel[] {
    return this._allEvents;
  }

  public chooseEvent(event: EventModel): void {
    this._dialogRef.close(event);
  }

  public onClickSeeLess() {
    this.loadMore = true;
    this._allEvents = [];
    if (this.queryControl.value) {
      this._skipWithSearchQuerry = 0;
      this._getMyEventByQuerry(this.queryControl.value, true);
    } else {
      this._skip = 0;
      this._getMyEvents();
    }
  }

  public onClickEventBlock(idOfEvent): void {
    this._dialogRef.close(true);
    const localisedUrl = this._utilitiesService.localizeRouter(`/event/${idOfEvent}`);
    this._router.navigate([localisedUrl]);
  }

  public resetInputText(): void {
    this.queryControl.patchValue('');
    this.resetBtn = false;
    this._getMyEvents();
  }
}
