import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {first, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {FiltersService} from '../../../services/filters.service';
import {SidebarFilterService} from '../../../services/sidebar-filter.service';

@Component({
  selector: 'app-mat-slider',
  templateUrl: './mat-slider.component.html',
  styleUrls: ['./mat-slider.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MatSliderComponent implements OnInit, OnDestroy {
  public value: number;
  private _windowWidth: boolean = window.innerWidth < 568;
  private unsubscribe$: Subject<void> = new Subject<void>();
  @Input('isDynamicSearch') private _isDynamicSearch: boolean = false;
  @Input('isAddress') public showSlider: boolean = false;
  @Output() public radius = new EventEmitter<number>();
  @Input()
  public saveState = false;
  public isOnline = false

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _filtersService: FiltersService
  ) {
    this.value = 50;
  }

  ngOnInit() {
    this._checkQueryParams();

    if (this.saveState) {
      SidebarFilterService.getFilterAsObservable()
        .pipe(first())
        .subscribe((data: any) => {
            if (!!data && (!!data.radius || data.radius === 0)) {
              this.value = data.radius;
            }
          }
        );

      SidebarFilterService.resetAction
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.value = 50;
        });
    }
    this._filtersService.isOnline.subscribe((resp:boolean) => {
      this.isOnline = resp
    })
  }

  private _checkQueryParams(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data.distance) {
          if (+data.distance != this.value) {
            this.value = +data.distance;
            this.radius.emit(this.value);
          }
        } else {
            this.value = 50;
            this.radius.emit(this.value);
        }
        this._checkSmallDevice();

      });
  }

  public emitRadius() {
    setTimeout(() => {
      this.radius.emit(this.value);
    }, 100);
  }

  public formatLabel(value: number | null): number | string {
    if (!value) {
      return 0;
    } else {
      return value;
    }
  }

  public itChanged(value: number): void {
    this.value = value;
  }

  private _checkSmallDevice(): void {
    if (this._windowWidth && !this._isDynamicSearch) {
       this.showSlider =  this._filtersService.getSelectedFilters().autocomplete.isAddress;
       this.value = this._filtersService.getSelectedFilters().distance;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
