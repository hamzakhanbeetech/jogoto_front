import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { DublicateEventModalComponent } from "./components/dublicate-event-modal/dublicate-event-modal.component";
import { CropImageComponent } from "../components/crop-image/crop-image.component";
import { MatModalComponent } from "../../../../shared/components/mat-modal/mat-modal.component";
import { TranslateService } from "@ngx-translate/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import * as moment from "moment-timezone";
import { ActivatedRoute, Router } from "@angular/router";

import {
  SubjectsInteractionsService,
  UtilitesService,
  FiltersService,
} from "../../../..//services";
import {
  UserModel,
  EventModel,
  ServerResponse,
} from "../../../..//models/global.models";
import { CreateEventModel, Poster } from "./create-event.models";
import { CreateEventService } from "./create-event.service";
import { GroupModel } from "../../../../models";
import { CalendarConstants } from "../../../../constants/calendar.constants";
import { UploadService } from "../../../../services/upload.service";
import { debounceTime, first, takeUntil } from "rxjs/operators";
import _ from "lodash";
@Component({
  selector: "app-create-event",
  templateUrl: "./create-event.view.html",
  styleUrls: ["./create-event.view.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CreateEventView implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("container", { static: true }) private _container: ElementRef;
  @ViewChild("backdrop", { static: true }) private _backdrop: ElementRef;
  @ViewChild("highlights", { static: true }) private _highlights: ElementRef;
  @ViewChild("textarea", { static: true }) private _textarea: ElementRef;
  @ViewChild("cropImage", { static: true })
  private _cropImage: CropImageComponent;

  private _ua = window.navigator.userAgent.toLowerCase();
  private _isIE = !!this._ua.match(/msie|trident\/7|edge/);
  private _isWinPhone = this._ua.indexOf("windows phone") !== -1;
  private _isIOS = !this._isWinPhone && !!this._ua.match(/ipad|iphone|ipod/);
  public currentDate: Date = this.roundTime(new Date());
  private _eventForm: FormGroup;
  public serverSideValidationError: string;
  private _categoriesHaveBeenChanged: boolean = false;
  private _categoryFilterSubscription: Subscription = new Subscription();
  private _filterContentSubscription: Subscription = new Subscription();
  private _categoriesListSubscription: Subscription = new Subscription();
  private _langSubscription: Subscription = new Subscription();
  private _routeSubscriber: Subscription = new Subscription();
  private _isEditing: boolean;
  private _editingEventId: string = "";
  private _userInformation: UserModel;
  public checkEventType: Array<object>;
  public info: any;
  private _tomorrow: Date;
  public utcList: string[] = [];
  public utcSet: string[];
  public defaultTimeMaxData: Date = new Date();
  public maxDate: Date[] = [];
  public submited: boolean = false;
  public groupInfo: GroupModel;
  private _creatorType: string;
  public endDateMin: Date = this._getEndDateDefault(new Date());
  public multyDateEndDateMin: Date[] = [];
  private _defaultTimeZone: string = `(GMT${moment
    .tz(moment.tz.guess())
    .format("Z")}) ${moment.tz.guess()}`;
  public calendarSettings: any;
  public checkedCategories: any = [];
  public checkedFilters: any = [];
  public smallDisplay: boolean = false;
  public imageLoading: boolean = false;
  private imageIsReady: any = {
    cropped: false,
    original: false,
  };
  private isClickedCreated: boolean = false;

  private unsubscribe$: Subject<void> = new Subject<void>();
  private isDefaultImage: boolean = true;
  private isOnce: boolean = true;
  public requiredFields: any = [];
  public minDateMulti;
  public maxDateMulti;

  private isImageUpload: boolean = false;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    const width = event.target.innerWidth;

    if (width > 577) {
      this._dialog.closeAll();
    }
    this.smallDisplay = width <= 576;
  }

  public title: any;
  public loading: boolean = false;
  public pastEventsExist: boolean = false;
  public userGroups = [];
  private urlPattern =
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  constructor(
    private _dialog: MatDialog,
    private _translate: TranslateService,
    private _fb: FormBuilder,
    private _subjectInteractionService: SubjectsInteractionsService,
    private _createEventService: CreateEventService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _utilitiesSevice: UtilitesService,
    private _filtersService: FiltersService,
    private _uploadService: UploadService,
    private _zone: NgZone
  ) {
    this._tomorrow = new Date(
      new Date().setMinutes(new Date().getMinutes() + 90)
    );
    this.getMyEvents();
    // this._filtersService.resetFilters();
  }

  private _fixIOS() {
    let paddingLeft = this._highlights.nativeElement.style.paddingLeft;
    let paddingRight = this._highlights.nativeElement.style.paddingRight;
    paddingLeft += 3;
    this._highlights.nativeElement.style.paddingLeft = paddingLeft + "px";
    paddingRight += 3;
    this._highlights.nativeElement.style.paddingRight = paddingRight + "px";
  }

  ngOnInit() {
    this._translate
      .get(["filter.event_filters", "filter.categories"])
      .subscribe((translated) => {
        this.title = {
          dropdownFilter: translated["filter.event_filters"],
          dropdownCats: translated["filter.categories"],
        };
      });

    this.calendarSettings = CalendarConstants.SETTINGS;
    this.smallDisplay = window.innerWidth <= 576;
    if (this._isIOS) {
      this._fixIOS();
    }
    this._subscribeToCategoriesList();
    this._formBuilder();
    this._handleCategoryChangeEvent();
    this._handleFilterChangeEvent();
    this._fetchUserInformation();
    this._getUserGroups();

    this._translate
      .get([
        "create-event.public_event",
        "create-event.public_event_desc",
        "create-event.private_event",
        "create-event.private_event_desc",
        "create-event.event_information",
        "create-event.event_information_desc",
      ])
      .subscribe((translated: string) => {
        this.checkEventType = [
          {
            icon: "icon-public-globe",
            title: this._translate.instant("create-event.public_event"),
            description: this._translate.instant(
              "create-event.public_event_desc"
            ),
            value: "public",
          },
          {
            icon: "icon-mail",
            title: this._translate.instant("create-event.private_event"),
            description: this._translate.instant(
              "create-event.private_event_desc"
            ),
            value: "private",
          },
        ];
        this.info = {
          title: this._translate.instant("create-event.event_information"),
          description: this._translate.instant(
            "create-event.event_information_desc"
          ),
        };
      });

    this._getTimeZones();
    this.checkLang();
    this._subjectInteractionService.pageTags.next({
      title: `tags.create_event_title`,
      desc: `tags.create_event_desc`,
    });
  }

  ngAfterViewInit() {
    this._subjectInteractionService.inCreateEventPage.next(true);
  }

  private _getTimeZones() {
    let timeZones = moment.tz.names();
    this.utcList = [];
    this.utcList.push(this._defaultTimeZone);
    for (let i in timeZones) {
      this.utcList.push(
        "(GMT" + moment.tz(timeZones[i]).format("Z") + ") " + timeZones[i]
      );
    }
    this.utcSet = this.utcList;
  }

  private checkLang() {
    this._langSubscription = this._subjectInteractionService
      .getCurrentLang()
      .subscribe((lang) => {
        if (lang == "fr") {
          this.calendarSettings = CalendarConstants.SETTINGSFr;
        } else {
          this.calendarSettings = CalendarConstants.SETTINGS;
        }
      });
  }


public eventDefaultStartDateTime =  new Date(Date.now());
  private _formBuilder(): void {
    this.eventDefaultStartDateTime.setHours(this.eventDefaultStartDateTime.getHours() + 1);
    const nonWhitespaceRegExp: RegExp = new RegExp(
      "\\s*(?:[\\w\\S+\\.]\\s*){4,}$"
    );
    this._eventForm = this._fb.group({
      title: [
        null,
        [
          Validators.required,
          Validators.pattern(nonWhitespaceRegExp),
          Validators.minLength(4),
        ],
      ],
      description: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(new RegExp("\\S")),
        ],
      ],
      poster: [null],
      category: [null, Validators.required],
      filter: [null],
      isOnline: [false],
      location: [null, [Validators.required, this._locationValidator]],
      visibility: [null, Validators.required],
      defaultTime: this._fb.group(
        {
          startDate: [this.roundTime(this.eventDefaultStartDateTime), Validators.required],
          endDate: [this.roundTime(this._tomorrow), Validators.required],
          timeZone: [this._defaultTimeZone, Validators.required],
        },
        { validator: this._dateValidator("startDate", "endDate", false) }
      ),
      multiTimes: this._fb.array([]),
    });
    this.defaultTimeMaxData = new Date(
      new Date(this.eventDefaultStartDateTime).setMonth(this.eventDefaultStartDateTime.getMonth() + 1)
    );
    this._eventForm.get("description").valueChanges.subscribe((value) => {
      const highlightedText = this._applyHighlights(value);

      this._highlights.nativeElement.innerHTML = highlightedText;
    });
    this.requiredFields = [
      {
        title: "create-event.title",
        formName: "title",
      },
      {
        title: "filter.category",
        formName: "category",
      },
      {
        title: "create-event.description_title",
        formName: "description",
      },
      {
        title: "create-event.location",
        formName: "location",
      },
    ];

    let latestDate = this._tomorrow;
    this._eventForm
      .get("defaultTime.startDate")
      .valueChanges.subscribe((data) => {
        this.checkMaxDate();
        const selectDate: Date = new Date(data);
        this.endDateMin = this._getEndDateDefault(selectDate);
        this.sortDates([
          {
            startDate: this._eventForm.get("defaultTime.startDate").value,
            endDate: this._eventForm.get("defaultTime.endDate").value,
          },
          ...this.multiTimeFormArray.getRawValue(),
        ]);
        latestDate = this.endDateMin;
        this._eventForm.get("defaultTime.endDate").setValue(this.endDateMin);
        // if (this._getDateDiff(selectDate, latestDate) <= 30) {
        //   latestDate = this.endDateMin;
        //   this._eventForm.get("defaultTime.endDate").setValue(this.endDateMin);
        // }
        selectDate.setMonth(selectDate.getMonth() + 1);
        this.defaultTimeMaxData = selectDate;
        this.checkMaxDate(this.defaultTimeMaxData);
      });
    this._eventForm
      .get("defaultTime.endDate")
      .valueChanges.subscribe((data) => {
        this.sortDates([
          {
            startDate: this._eventForm.get("defaultTime.startDate").value,
            endDate: this._eventForm.get("defaultTime.endDate").value,
          },
          ...this.multiTimeFormArray.getRawValue(),
        ]);
      });
    this.sortDates([
      {
        startDate: this._eventForm.get("defaultTime.startDate").value,
        endDate: this._eventForm.get("defaultTime.endDate").value,
      },
      ...this.multiTimeFormArray.getRawValue(),
    ]);
    // this.sortDates([this._eventForm.get('defaultTime').value,...this.multiTimeFormArray.getRawValue()]);
  }

  private _getEndDateDefault(date: Date): Date {
    return new Date(date.setMinutes(date.getMinutes() + 30));
  }

  private _getDateDiff(selectDate: Date, endDate: Date): number {
    const a = moment(selectDate);
    const b = moment(endDate);
    return b.diff(a, "minutes");
  }

  public markControlAsTouched(control: AbstractControl) {
    control.markAsTouched();
    setTimeout(() => {
      if (
        control.value &&
        control.value.autocomplete &&
        typeof control.value.latLng.lat == "string"
      ) {
        this._eventForm.get("location").setErrors(null);
      }
    }, 500);
  }

  private _subscribeToCategoriesList(): void {
    this._categoriesListSubscription =
      this._subjectInteractionService.categoriesListFetched
        .pipe(first())
        .subscribe(() => {
          this._checkIfEdit();
        });
    if (this.smallDisplay) {
      this._checkIfEdit();
    }
  }

  private _checkIfEdit(): void {
    this._routeSubscriber = this._activatedRoute.queryParams.subscribe(
      (params) => {
        if (params.event_id && !params.new_event) {
          this._isEditing = true;
          this._editingEventId = params.event_id;
          this._getEventById(params.event_id);
        } else if (params.event_id) {
          this._getEventById(params.event_id);
        } else {
          setTimeout(() => {
            this._eventForm.patchValue({
              visibility: "public",
            });
          }, 500);
        }
        if (params.groupId) {
          this._getGroup(params.groupId);
        } else if (!params.event_id) {
          this._creatorType = "user";
          this.groupInfo = null;
        }
      }
    );
  }

  public handleCrop(data): void {
    const event: Poster = data.poster;
    if (data.isSave == "save") {
      this.imageLoading = true;

      this.uploadImage(event);

      this._eventForm.get("poster").setValue(event);
    } else if (data.isSave == "delete") {
      this.isDefaultImage = true;
      this._eventForm.get("poster").setValue(null);
    }
  }

  public handleTitleEvent(value: string): void {
    this._eventForm.get("title").setValue(value);
  }

  private _fetchUserInformation(): void {
    this._userInformation = JSON.parse(localStorage.getItem("user_data"));
  }

  public roundTime(defaultTime) {
    const time = 1000 * 60 * 5;
    const date = new Date(defaultTime);
    const rounded = new Date(date.getTime() + time - (date.getTime() % time));
    return rounded;
  }

  private _dateValidator(
    startDateKey: string,
    endDateKey: string,
    isMultiDate: boolean = true
  ) {
    return (group: FormGroup): { [key: string]: any } => {
      const startDate = new Date(group.controls[startDateKey].value);
      const endDate = new Date(group.controls[endDateKey].value);
      if (endDate.getTime() < startDate.getTime()) {
        group.controls[endDateKey].setErrors({
          invalidDate: true,
        });
      }
      if (
        endDate.getTime() / 1000 / 60 - 10 <
        startDate.getTime() / 1000 / 60
      ) {
        group.controls[endDateKey].setErrors({
          invalidDate: true,
        });
      }
      // if (isMultiDate) {
      if (startDate > this.maxDateMulti) {
        group.controls[startDateKey].setErrors({
          invalidDate: true,
        });
      }
      if (endDate > this.maxDateMulti) {
        group.controls[endDateKey].setErrors({
          invalidDate: true,
        });
      }
      // }else{
      //   if (endDate > this.defaultTimeMaxData) {
      //     group.controls[endDateKey].setErrors({
      //       invalidDate: true
      //     });
      //   }else{
      //     group.controls[endDateKey].setErrors(null)
      //   }
      // }
      if (startDate < this.currentDate) {
        group.controls[startDateKey].setErrors({
          invalidDate: true,
        });
      }

      return null;
    };
  }

  private _locationValidator(control: FormControl) {
    if (control.value && typeof control.value.latLng.lat == "string") {
      return { invalidLocation: true };
    }
    if (
      control.value &&
      control.value.autocomplete &&
      control.value.autocomplete.length <= 1
    ) {
      return { invalidLocation: true };
    }
    return null;
  }

  private _applyHighlights(text: string): string {
    text = text
      .replace(/#[_A-Za-z0-9].*?\b/g, "<mark>$&</mark>")
      .replace(/\n/g, "<br/>");
    if (this._isIE) {
      text = text.replace(/ /g, " <wbr>");
    }
    return text;
  }

  public addTimeControl(value?): void {
    const multiTimeFormArray = this._eventForm.get("multiTimes") as FormArray;
    const startDate = value
      ? new Date(value.start).getTime() < new Date().getTime()
        ? this.roundTime(this._getEndDateDefault(new Date()))
        : new Date(value.start)
      : null;
    const endDate = value
      ? new Date(value.end).getTime() < new Date().getTime()
        ? this._tomorrow
        : new Date(value.end)
      : null;
    const maxEndDate = new Date(endDate);
    maxEndDate.setMonth(maxEndDate.getMonth() + 1);
    this.maxDate.push(maxEndDate);

    const formGroup = this._fb.group(
      {
        startDate: new FormControl(startDate, Validators.required),
        endDate: new FormControl(endDate, Validators.required),
      },
      { validator: this._dateValidator("startDate", "endDate") }
    );
    multiTimeFormArray.push(formGroup);
    let i = this.maxDate.length - 1;
    let latestDate = new Date(formGroup.get("endDate").value);

    if (value) {
      this.multyDateEndDateMin.push(new Date(formGroup.get("endDate").value));
      const EndDate = new Date(formGroup.get("startDate").value);
      this.multyDateEndDateMin[i] = this._getEndDateDefault(EndDate);
      if (this._getDateDiff(EndDate, latestDate) <= 30) {
        latestDate = this.multyDateEndDateMin[i];
        formGroup.get("endDate").setValue(this.multyDateEndDateMin[i]);
      }
    }
    formGroup.get("startDate").invalid
      ? formGroup.get("endDate").disable()
      : formGroup.get("endDate").enable();
    formGroup.get("startDate").valueChanges.subscribe((data) => {
      formGroup.get("endDate").enable();
      latestDate = new Date(formGroup.get("endDate").value);
      let maxEndDate = new Date(data);
      this.multyDateEndDateMin[i] = this._getEndDateDefault(maxEndDate);
      if (this._getDateDiff(maxEndDate, latestDate) <= 30) {
        latestDate = this.multyDateEndDateMin[i];
        formGroup.get("endDate").setValue(this.multyDateEndDateMin[i]);
      }
      this.sortDates([
        {
          startDate: this._eventForm.get("defaultTime.startDate").value,
          endDate: this._eventForm.get("defaultTime.endDate").value,
        },
        ...this.multiTimeFormArray.getRawValue(),
      ]);
      maxEndDate.setMonth(maxEndDate.getMonth() + 1);
      this.maxDate[i] = maxEndDate;
      this.checkMaxDate();
    });
    formGroup.get("endDate").valueChanges.subscribe((data) => {
      this.sortDates([
        {
          startDate: this._eventForm.get("defaultTime.startDate").value,
          endDate: this._eventForm.get("defaultTime.endDate").value,
        },
        ...this.multiTimeFormArray.getRawValue(),
      ]);
    });
  }

  private checkMaxDate(date?) {
    const dateArr = this.multiTimeFormArray.getRawValue();
    dateArr.push({
      startDate: this._eventForm.get("defaultTime.startDate").value,
    });
    const a = dateArr.sort((a, b) => b.startDate - a.startDate);
    let firstDate;
    if (a[a.length - 1].startDate) {
      firstDate = new Date(a[a.length - 1].startDate);
    } else {
      firstDate = new Date(a[0].startDate);
    }
    this.defaultTimeMaxData = new Date(
      firstDate.setMonth(firstDate.getMonth() + 1)
    );
  }

  private sortDates(dates, isDelete = false) {
    if (dates.length < 2 && isDelete) {
      return { maxDate: this.defaultTimeMaxData, minDate: this.currentDate };
    }
    let selectedStart = dates[0].startDate;
    let selectedEnd = dates[0].endDate;
    for (let ind = 1; ind < dates.length; ind++) {
      if (selectedStart) {
        if (
          dates[ind].startDate &&
          new Date(selectedStart) >= new Date(dates[ind].startDate)
        ) {
          selectedStart = dates[ind].startDate;
        }
        if (
          dates[ind].endDate &&
          new Date(selectedEnd) <= new Date(dates[ind].endDate)
        ) {
          selectedEnd = dates[ind].endDate;
        }
      }
    }

    const selectDateStart: Date = new Date(selectedStart);
    const maxDate = new Date(
      selectDateStart.setMonth(selectDateStart.getMonth() + 1)
    );
    const selectDateEnd: Date = new Date(selectedEnd);
    const minDate = new Date(
      selectDateEnd.setMonth(selectDateEnd.getMonth() - 1)
    );
    this.minDateMulti = minDate < this.currentDate ? this.currentDate : minDate;
    this.maxDateMulti = maxDate;
  }

  public removeTheDate(e): void {
    this.multyDateEndDateMin.splice(e + 1, 1);
    this.maxDate.splice(e + 1, 1);
    this.multiTimeFormArray.removeAt(e);
    this.checkMaxDate();
    this.sortDates([
      {
        startDate: this._eventForm.get("defaultTime.startDate").value,
        endDate: this._eventForm.get("defaultTime.endDate").value,
      },
      ...this.multiTimeFormArray.getRawValue(),
    ]);
  }

  get datesControl(): FormArray {
    let controls = this._eventForm.get("multiTimes") as FormArray;
    return controls;
  }

  private _handleCategoryChangeEvent(): void {
    this._categoryFilterSubscription =
      this._subjectInteractionService.categoryFilterCreateEvent
        .pipe(debounceTime(200))
        .subscribe((categoriesValue: any) => {
          if (categoriesValue.categoryFilter != null) {
            this.checkedCategories = [];
            if (categoriesValue.categoryFilter.split(",").length > 2) {
              this._eventForm.get("category").setErrors({
                maxCategory: true,
              });
            } else {
              if (categoriesValue.categoryFilter.length > 0) {
                this._categoriesHaveBeenChanged = true;
              }
              setTimeout(() => {
                this.checkedCategories = categoriesValue.categories;
              }, 0);
              this._eventForm
                .get("category")
                .setValue(categoriesValue.categoryFilter);
            }
          }
        });
  }

  private _handleFilterChangeEvent(): void {
    this._filterContentSubscription =
      this._subjectInteractionService.filterContentCreateEvent.subscribe(
        (filtersValue: any) => {
          this._eventForm.get("filter").setValue(filtersValue.filter);
          if (filtersValue.filter) {
            let arr = [];
            const filtersArr = filtersValue.filter.split(",");
            filtersArr.forEach((filter) => {
              arr.push({
                name: filter,
              });
            });
            setTimeout(() => {
              this.checkedFilters = arr;
            }, 0);
          } else {
            setTimeout(() => {
              this.checkedFilters = [];
            }, 0);
          }
        }
      );
  }

  public handleScrollEvent(): void {
    const scrollTop = this._textarea.nativeElement.scrollTop;
    this._backdrop.nativeElement.scrollTop = scrollTop;
    const scrollLeft = this._textarea.nativeElement.scrollLeft;
    this._backdrop.nativeElement.scrollLeft = scrollLeft;
  }

  public openDublicateModal(): void {
    const dialogConfig = new MatDialogConfig();
    let dialogRef = this._dialog.open(
      DublicateEventModalComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((event: EventModel) => {
      if (event) {
        this._dublicateEvent(event);
      }
    });
  }

  public getMyEvents() {
    this._createEventService
      .getMyEvents({ limit: 1, skip: 0 })
      .subscribe((response: ServerResponse<any>) => {
        this.pastEventsExist = response.data.length;
      });
  }

  private _dublicateEvent(event: EventModel): void {
    let now = new Date(Date.now());
    now.setHours(now.getHours() + 1);
    this.isDefaultImage = event.poster.default_image;

    if (event.create_type == "group") {
      this.groupInfo = event.organizer as GroupModel;
      this._creatorType = "group";
    } else {
      this._creatorType = "user";
    }
    if (event.event_create_type) {
      this._eventForm.patchValue({
        description: this._utilitiesSevice.unwrapLinkFromTag(event.description),
        visibility: event.visibility,
      });
    }
    if (event.dates.length >= 0) {
      let startDate =
        new Date(event.dates[0].start).getTime() < new Date().getTime()
          ? this.roundTime(now)
          : new Date(event.dates[0].start);
      let endDate =
        new Date(event.dates[0].start).getTime() < new Date().getTime()
          ? this.roundTime(this._tomorrow)
          : new Date(event.dates[0].end);
      let checkedZone = this.utcSet.filter((zone, i) => {
        return zone == event.dates[0].text;
      });
      if (!checkedZone.length) {
        checkedZone[0] = this._defaultTimeZone;
      }
      this._eventForm.get("defaultTime").patchValue({
        startDate,
        endDate,
        timeZone: checkedZone[0],
      });
      if (event.dates.length > 0) {
        const croppedDate = event.dates.splice(0, 1);
        croppedDate.map((date) => {
          this.addTimeControl(date);
        });
      }
      this._clearFormArray(this._eventForm.get("multiTimes") as FormArray);

      event.dates.map((date) => {
        this.addTimeControl(date);
      });
    }

    if (this.isOnce) {
      this.setFilter(event.filters, event.category);
      this.isOnce = false;
    }
    this._eventForm.get("isOnline").patchValue(event.isOnline);
    if (event.isOnline) {
      this._eventForm.removeControl("location");
      this._eventForm.addControl(
        "webAddress",
        new FormControl(null, [
          Validators.required,
          Validators.pattern(this.urlPattern),
        ])
      );
      this._eventForm.addControl(
        "event_link",
        new FormControl(null, [
          Validators.required,
          Validators.pattern(this.urlPattern),
        ])
      );
      var index = _.findIndex(this.requiredFields, { formName: "location" });

      this.requiredFields.splice(index, 1, {
        title: "create-event.web_address",
        formName: "webAddress",
      });
      this.requiredFields.splice(index, 2, {
        title: "create-event.event_link",
        formName: "event_link",
      });
      this._eventForm.get("webAddress").patchValue(event.webAddress);
      this._eventForm.get("event_link").patchValue(event.event_link);
    }

    this._subjectInteractionService.eventCreateDuplicated.next(event);
    setTimeout(() => {
      if (this._cropImage.showCropperActions) {
        this._cropImage.saveImage();
      }
    }, 100);
  }

  private setFilter(filters, category) {
    this._subjectInteractionService.createEventFilters.next({
      filters,
      category,
    });
    let filtersStr = "";
    let categoriesStr = "";

    filters.forEach((filter) => {
      filtersStr += filter + ",";
      this.checkedFilters.push({
        name: filter,
      });
    });

    category.forEach((category) => {
      categoriesStr += category._id + ",";
      this.checkedCategories.push(category);
    });
    this._eventForm
      .get("filter")
      .setValue(filtersStr.substring(0, filtersStr.length - 1));
    this._eventForm
      .get("category")
      .setValue(categoriesStr.substring(0, categoriesStr.length - 1));
  }

  private _clearFormArray(formArray: FormArray): void {
    while (formArray.length) {
      formArray.removeAt(formArray.length - 1);
    }
  }

  public openDialog(name: string, title): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { name, title, checkAll: true };
    this._subjectInteractionService.createEventFilters.next({
      filters: this.checkedFilters,
      category: this.checkedCategories,
    });
    const dialogRef = this._dialog.open(MatModalComponent, dialogConfig);
    dialogRef.afterOpened().subscribe(() => {
      this._subjectInteractionService.inCreateEventPage.next(true);
    });
  }

  public onCreateEvent(): void {
    if (this._eventForm.valid) {
      this._createOrEditEvent();
    } else {
      this.submited = true;
    }
  }

  private _getEventById(id: string): void {
    this._createEventService
      .getEventById(id)
      .subscribe((res: ServerResponse<EventModel>) => {
        if (res.data.create_type !== "group") {
          this._userInformation = res.data.organizer as UserModel;
        }
        this._dublicateEvent(res.data);
      });
  }

  private checkUniqueDates(arr) {
    const seen = new Set();
    return arr.filter((el) => {
      const duplicate = seen.has(el.start + el.end);
      seen.add(el.start + el.end);
      return !duplicate;
    });
  }

  private _createOrEditEvent(): void {
    if (this._cropImage.showCropperActions) {
      this._cropImage.saveImage();
      return;
    }

    this.isClickedCreated = true;
    const sendingData = this.prepareDataForUpload();
    this.loading = true;
    console.log("test");
    if (!this.imageLoading) {
      this.uploadFullData(sendingData);
    }
  }

  private prepareDataForUpload(): CreateEventModel {
    let times = [];
    const regex = /[+-][0-9]{2}:[0-9]{2}\b/;
    const checkedZone = this._eventForm.get("defaultTime.timeZone").value;
    const found = checkedZone.match(regex);
    let timeZone = "+00:00";
    if (found) {
      timeZone = found[0];
    }
    times.push({
      start:
        moment(this.eventForm.get("defaultTime.startDate").value).format(
          "YYYY-MM-DD[Z]HH:mm:ss.SSS[Z]"
        ) + timeZone,
      end:
        moment(this.eventForm.get("defaultTime.endDate").value).format(
          "YYYY-MM-DD[Z]HH:mm:ss.SSS[Z]"
        ) + timeZone,
      text: checkedZone,
    });
    this._eventForm.get("multiTimes").value.filter((dateItem) => {
      times.push({
        start:
          moment(dateItem.startDate).format("YYYY-MM-DD[Z]HH:mm:ss.SSS[Z]") +
          timeZone,
        end:
          moment(dateItem.endDate).format("YYYY-MM-DD[Z]HH:mm:ss.SSS[Z]") +
          timeZone,
        text: checkedZone,
      });
    });
    times = this.checkUniqueDates(times);
    const sendingData: CreateEventModel = {
      name: this._eventForm.get("title").value.trim(),
      description: this._utilitiesSevice.checkURL(
        this._eventForm.get("description").value.trim()
      ),
      visibility: this._eventForm.get("visibility").value,
      category: this._eventForm.get("category").value.split(","),
      filters: this._eventForm.get("filter").value
        ? this._eventForm.get("filter").value.split(",")
        : null,
      isOnline: this._eventForm.get("isOnline").value,
      location: {
        lon: this._eventForm.get("location")
          ? this._eventForm.get("location").value.latLng.lng
          : null,
        lat: this._eventForm.get("location")
          ? this._eventForm.get("location").value.latLng.lat
          : null,
      },
      address: this._eventForm.get("location")
        ? this._eventForm.get("location").value.autocomplete
        : null,
      webAddress: this._eventForm.get("webAddress")
        ? !this._eventForm.get("webAddress").value.includes("https://") ?
        "https://"+this._eventForm.get("webAddress").value : this._eventForm.get("webAddress").value
        : null,
      event_create_type: {
        event_link: this._eventForm.get("event_link")
        ? !this._eventForm.get("event_link").value.includes("https://") ?
        "https://"+this._eventForm.get("event_link").value : this._eventForm.get("event_link").value
        : null,
        isLogo: true,
        is_me: true,
        site: ""
      },
      dates: times,
      create_type: this._creatorType == "group" ? "group" : null,
      group_id: this._creatorType == "group" ? this.groupInfo._id : null,
    };
    if (this._eventForm.get("poster").value) {
      sendingData.poster = this._eventForm.get("poster").value;
      sendingData.default_image =
        this._eventForm.get("poster").value.default_image;
    } else if (this.isEditing) {
      sendingData.default_image = this.isDefaultImage;
    } else {
      sendingData.default_image = true;
    }
    return sendingData;
  }

  private uploadFullData(sendingData) {
    if (this._isEditing) {
      this._createEventService
        .updateEventById(sendingData, this._editingEventId)
        .subscribe(
          (data) => {
            const localisedUrl = this._utilitiesSevice.localizeRouter(
              `basic/create-event/${this._editingEventId}/preview`
            );
            this._router.navigate([localisedUrl]);
          },
          (failureMessage) => {
            if (failureMessage.error) {
              this.serverSideValidationError =
                failureMessage.error.error.message;
            } else if (failureMessage.show) {
              this.serverSideValidationError = failureMessage.messageText;
            }
            this.loading = false;
          }
        );
    } else {
      this._createEventService.createEvent(sendingData).subscribe(
        (response: ServerResponse<EventModel>) => {
          const localisedUrl = this._utilitiesSevice.localizeRouter(
            `basic/create-event/${response.data._id}/preview`
          );
          this._router.navigate([localisedUrl]);
        },
        (failureMessage) => {
          if (failureMessage.error) {
            this.serverSideValidationError = failureMessage.error.error.message;
          } else if (failureMessage.show) {
            this.serverSideValidationError = failureMessage.messageText;
          }
          this.loading = false;
        }
      );
    }
  }

  private uploadImage(poster: Poster) {
    const imageData = _.cloneDeep(poster);

    if (!poster.default_image) {
      const body = {
        original: poster.original.data,
        cropped: poster.cropped.data,
        type: "event",
      };
      this._uploadService.uploadImage(body).subscribe((data) => {
        imageData.cropped.data = data.data.imageName;
        imageData.original.data = data.data.imageName;
        this._eventForm.get("poster").setValue({ ...imageData });
        this.imageLoading = false;
        // if (this.isClickedCreated) {
        //   const sendingData = this.prepareDataForUpload();
        //   this.uploadFullData(sendingData);
        // }
        const sendingData = this.prepareDataForUpload();
        this.uploadFullData(sendingData);
      });
    }
  }

  public closeCalendar(type) {
    type.hideOverlay();
  }

  private _getGroup(groupId: string): void {
    this._createEventService.getGroupById(groupId).subscribe(
      (data: ServerResponse<GroupModel>) => {
        this.groupInfo = data.data;
        this._creatorType = "group";
      },
      (error) => {
        this._creatorType = "user";
      }
    );
  }

  private _getUserGroups() {
    this._createEventService.getUserGroups().subscribe((groups) => {
      this.userGroups = groups.data;
    });
  }

  public onClickGroup(group) {
    this._creatorType = "group";
    this.groupInfo = group;
  }

  public onClickCreatorItem(creatorType: string): void {
    this._creatorType = creatorType;
  }
  public isOnlineCheckbox(value) {
    this._eventForm.controls.isOnline.setValue(value.checkboxValue);
    if (value.checkboxValue) {
      this._eventForm.removeControl("location");
      this._eventForm.addControl(
        "webAddress",
        new FormControl(null, [
          Validators.required,
          Validators.pattern(this.urlPattern),
        ])
      );
      this._eventForm.addControl(
        "event_link",
        new FormControl(null, [
          Validators.required,
          Validators.pattern(this.urlPattern),
        ])
      );
      var index = _.findIndex(this.requiredFields, { formName: "location" });

      this.requiredFields.splice(index, 1, {
        title: "create-event.web_address",
        formName: "webAddress",
      });
      this.requiredFields.splice(index, 2, {
        title: "create-event.event_link",
        formName: "event_link",
      });
    } else {
      this._eventForm.removeControl("webAddress");
      this._eventForm.removeControl("event_link");
      this._eventForm.addControl(
        "location",
        new FormControl(null, [Validators.required, this._locationValidator])
      );
      var index = _.findIndex(this.requiredFields, { formName: "webAddress" });

      this.requiredFields.splice(index, 1, {
        title: "create-event.location",
        formName: "location",
      });
    }
  }

  get creator(): string {
    if (this._creatorType == "user") {
      return `${this._userInformation.name} ${
        this._userInformation.surname ? this._userInformation.surname : ""
      }`;
    }
    if (this._creatorType == "group") {
      return this.groupInfo.name;
    }
  }

  get creatorImage(): string {
    if (this._creatorType == "user") {
      return this._userInformation.poster.min;
    }
    if (this._creatorType == "group") {
      return this.groupInfo.poster.cropped.link;
    }
  }

  get eventForm(): FormGroup {
    return this._eventForm;
  }

  get multiTimeFormArray(): FormArray {
    return this._eventForm.get("multiTimes") as FormArray;
  }

  get userInformation(): UserModel {
    return this._userInformation;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }

  get categoriesHaveBeenChanged(): boolean {
    return this._categoriesHaveBeenChanged;
  }

  get creatorType(): string {
    return this._creatorType;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this._categoryFilterSubscription.unsubscribe();
    this._filterContentSubscription.unsubscribe();
    this._routeSubscriber.unsubscribe();
    this._categoriesListSubscription.unsubscribe();
    this._langSubscription.unsubscribe();
    this._subjectInteractionService.createEventFilters.next({
      filters: null,
      category: null,
    });
  }
}
