import { FormBuilder, FormControl, Validators } from "@angular/forms";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";

import {
  DataShareService,
  GoogleApiService,
  SubjectsInteractionsService,
  UserService,
} from "../../../../../services";
import { MatModalComponent } from "../../../../../shared/components/mat-modal/mat-modal.component";
import { SocialIconsModalComponent } from "../social-icons-modal/social-icons-modal.component";
import { debounceTime, last, switchMap, takeUntil } from "rxjs/operators";
import { ValidatorHelper } from "../../../../../helpers/validator.helper";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { UserModel } from "../../../../../models";
import { Observable, Subject } from "rxjs";
import {
  SearchCountryField,
  TooltipLabel,
  CountryISO,
} from "ngx-intl-tel-input";
export interface IPhone {
  phones: string[];
}

@Component({
  selector: "app-about-page-edit",
  templateUrl: "./about-page-edit.component.html",
  styleUrls: ["./about-page-edit.component.scss"],
})
export class AboutPageEditComponent implements OnInit, OnChanges {
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  @Input()
  public organization: UserModel;

  @Output()
  public organData: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public phonesData: EventEmitter<IPhone> = new EventEmitter<IPhone>();

  public selectedCategories: any[] = [];

  public description: FormControl = new FormControl("");
  public isEditDescr: boolean = true;
  private websiteReg =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[\w0-9]+([\-\.]{1}[\w0-9]+)*\.[\w]{2,5}(:[0-9]{1,5})?(\/.*)?$/im;
  public website: FormControl = new FormControl("", [
    Validators.required,
    Validators.pattern(this.websiteReg),
  ]);
  public isEditWebsite: boolean = true;

  public isEditLocation: boolean = true;

  public isEditHours: boolean = true;

  public isEditSecondEmail: boolean;
  public secondEmail: FormControl = new FormControl("", [
    Validators.required,
    Validators.pattern(ValidatorHelper.EMAIL_REGEXP),
  ]);

  public editPhones = {
    0: false,
    1: false,
  };
  public firstPhoneControl: FormControl = new FormControl(
    "",
    Validators.required
  );

  public lastPhoneControl: FormControl = new FormControl(
    "",
    Validators.required
  );

  public cityData: any = {}; // get datas from google api for city location
  public location: FormControl = new FormControl("", Validators.required);
  public smallDisplay: boolean = window.innerWidth < 568;
  public title = {
    dropdownCats: this._translate.instant("filter.categories"),
  };
  public reg = new RegExp("^([0-1][0-9]|[2][0-3]):([0-5][0-9])$");
  public hoursAreValid: boolean = true;

  /* business hours */
  public availableHours: any[] = [
    {
      name: "selected_hours",
      checked: true,
    },
    {
      name: "always_open",
      checked: false,
    },
    {
      name: "no_hours",
      checked: false,
    },
  ];
  public isClosed: boolean = true;
  public businessHours: any[] = [
    {
      dayName: "monday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
    {
      dayName: "tuesday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
    {
      dayName: "wednesday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
    {
      dayName: "thursday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
    {
      dayName: "friday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
    {
      dayName: "saturday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
    {
      dayName: "sunday",
      checked: false,
      isPlus: false,
      hours: [
        {
          start: "09:00",
          end: "17:00",
        },
        {
          start: "18:00",
          end: "19:00",
        },
      ],
    },
  ];

  public convertToHours(
    value: string,
    index: number,
    el: HTMLInputElement,
    type: string,
    isSecondHalf: boolean = false
  ): void {
    this.hoursAreValid = this.reg.test(value);
    const pattern: RegExp = /[^\d.-]/g;
    const txt = value.replace(pattern, "");
    let hoursIndex = 0;
    if (isSecondHalf) {
      hoursIndex = 1;
    }

    const item = this.businessHours[index].hours[hoursIndex];
    if (txt.length > 1 && txt.length < 3) {
      const parsedValue: number = parseInt(txt.slice(0, 2), 10);

      if (parsedValue <= 24) {
        item[type] = txt + ":";
      } else {
        item[type] = el.value = "0" + txt.slice(0, txt.length - 1) + ":";
      }
    } else if (txt.length > 2) {
      const parsedValue: number = parseInt(txt.slice(2), 10);
      if (parsedValue <= 59) {
        item[type] = txt.slice(0, 2) + ":" + txt.slice(2);
      } else {
        item[type] = el.value =
          txt.slice(0, 2) + ":0" + txt.slice(2, txt.length - 1);
      }
    } else {
      item[type] = el.value = txt;
    }
    this.hoursAreValid = this.reg.test(item[type]);
    this.checkHours(index, el);
  }

  public checkHours(index: number, el: HTMLInputElement): void {
    const hours = this.businessHours[index].hours;

    compareTwoInput(hours[0].start, hours[0].end);
    compareTwoInput(hours[1].start, hours[1].end);

    function compareTwoInput(startValue, endValue) {
      const start = startValue.split(":");
      const end = endValue.split(":");

      if (parseInt(start[0], 10) > parseInt(end[0], 10) && end[0].length > 1) {
        el.value = "";
      } else if (
        parseInt(start[0], 10) === parseInt(end[0], 10) &&
        end[0].length > 1
      ) {
        if (
          parseInt(start[1], 10) > parseInt(end[1], 10) &&
          end[1].length > 1
        ) {
          el.value = end[0] + ":";
        }
      }
    }
  }

  public saveHours(): void {
    let isChecked = false;
    const body = {
      type: "update-page-times",
      open_times: {},
      open_times_checkbox: "",
    };
    this.availableHours.forEach((item) => {
      if (item.checked) {
        body.open_times_checkbox = item.name;
      }
    });
    for (let i = 0; i < this.businessHours.length; i++) {
      if (this.businessHours[i].checked) {
        isChecked = true;
        if (
          this.businessHours[i].hours[0].start &&
          this.businessHours[i].hours[0].end
        ) {
          if (this.businessHours[i].isPlus) {
            body.open_times[++i] = this.businessHours[--i].hours;
          } else {
            body.open_times[++i] = [this.businessHours[--i].hours[0]];
          }
        } else {
          return;
        }
      }
    }

    if (!isChecked) {
      body.open_times_checkbox = "no_hours";
    }
    //
    // this.businessHours.forEach((item, index) => {
    //   if (item.checked && item.hours[0].start && item.hours[0].end) {
    //     if (item.isPlus) {
    //       body.open_times[++index] = item.hours;
    //     } else {
    //       body.open_times[++index] = item.hours.slice(0, 1);
    //     }
    //   }
    // });
    this.organData.emit(body);
  }

  public resetCheckedReason(index: number): void {
    this.availableHours.forEach((res) => {
      res.checked = false;
    });
    this.availableHours[index].checked = true;
  }

  /* business hours */

  private _latLon: any;
  private unsubscribe$: Subject<void> = new Subject<void>();

  @HostListener("window:resize", ["$event"])
  public onResize(event) {
    if (event.target.innerWidth > 575) {
      this._dialog.closeAll();
      this.smallDisplay = false;
    } else {
      this.smallDisplay = true;
    }
  }

  constructor(
    private fb: FormBuilder,
    private _googelService: GoogleApiService,
    private _dialog: MatDialog,
    private _dataShareService: DataShareService,
    private _userService: UserService,
    private _subjectInteractions: SubjectsInteractionsService,
    private _translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["organization"].currentValue) {
      this.isEditDescr =
        this.isEditWebsite =
        this.isEditLocation =
        this.isEditHours =
          true;

      this.description.patchValue(this.organization.description || "");
      this.website.patchValue(this.organization.website || "");
      this.location.patchValue(this.organization.address.full_address);

      if (this.organization.emails.length > 1) {
        this.secondEmail.patchValue(this.organization.emails[1]);
      }

      if (this.organization.phones.length > 0) {
        this.firstPhoneControl.patchValue(this.organization.phones[0]);
      } else if (this.organization.phones.length > 1) {
        this.lastPhoneControl.patchValue(this.organization.phones[1]);
      }

      const phones = this.organization.phones;

      if (phones.length > 0) {
        this.firstPhoneControl.patchValue(phones[0]);
        this.lastPhoneControl.patchValue(phones[1] || "");
      }
      this.selectedCategories = this.organization.categories.map(
        (cat) => cat._id
      );
      this.initHours();
    }
  }

  ngOnInit() {
    this._subjectInteractions.$checkedInterestsSubject
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.selectedCategories = res;
        this._dataShareService.userCategories = res;

        const body = {
          categories: res,
        };
        this._userService.updateUserCats(body).subscribe((res) => {
          this.organization = res.data;
        });
      });
  }

  public checkField(e: any, formControlName: string) {
    //const pattern = /[^\-\+\(\)\s\d]+/im;
    //let replacedValue = e.target.value.replace(pattern, "");
    const input = e.target.value.replace(/\D/g, "").slice(0, 13); // First ten digits of input only
    const carrier = input.slice(0, 3);
    const number = input.slice(3, 10);
    //const middle = input.slice(6, 9);
    //const last = input.slice(9, 13);
    if (input.length >= 10) {
      this[formControlName].patchValue(`${carrier} ${number}`);
    } else if (input.length > 3) {
      this[formControlName].patchValue(`${carrier} ${number}`);
    }
    // else if (input.length > 6) {
    //   this[formControlName].patchValue(`(+${zip}) ${first} ${middle}`);
    // } else if (input.length > 3) {
    //   this[formControlName].patchValue(`(+${zip}) ${first}`);
    // }
    // replacedValue = replacedValue.replace(/\s{2,}/, ' ');
    //
    // this[formControlName].patchValue(replacedValue);
  }

  private updateOrganizationInfo(body: any, type?: string) {
    const data = body;

    if (type) {
      data.type = type;
    }

    this.organData.emit(data);
  }

  public updateEmails(event = "add"): void {
    const body = {
      email: event === "remove" ? "" : this.secondEmail.value,
    };

    this._userService.updateProfUserEmail(body).subscribe(
      (res) => {
        this.secondEmail.setValue("");
        this.secondEmail.markAsUntouched();
        this.isEditSecondEmail = !this.isEditSecondEmail;
        this.organization.emails = res.data.emails;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public phonesEdit(index: number): void {
    if (index === 0) {
      this.editPhones[0] = !this.editPhones[0];
      this.editPhones[1] = false;
    } else {
      this.editPhones[1] = !this.editPhones[1];
      this.editPhones[0] = false;
    }
  }

  public addPhones(index: number): void {
    const body = {
      phones: [],
    };
    this.editPhones[index] = false;

    if (this.firstPhoneControl.value) {
      body.phones.push(this.firstPhoneControl.value.internationalNumber);
    }
    if (this.lastPhoneControl.value) {
      body.phones.push(this.lastPhoneControl.value.internationalNumber);
    }

    this.phonesData.emit(body);
  }

  public removePhone(index): void {
    const body = {
      phones: [],
    };

    this.editPhones[index] = !this.editPhones[index];

    if (index === 0) {
      this.firstPhoneControl.reset();
    } else {
      this.lastPhoneControl.reset();
    }

    body.phones = [
      this.firstPhoneControl.value
        ? this.firstPhoneControl.value.internationalNumber
        : "",
      this.lastPhoneControl.value
        ? this.lastPhoneControl.value.internationalNumber
        : "",
    ];

    this.phonesData.emit(body);
  }

  /**
   * @desc will change description of organization
   */

  public saveDescr(): void {
    const body = {
      description: this.description.value,
    };

    this.updateOrganizationInfo(body, "description");
  }

  /**
   * @desc remove the link to the organization’s website
   */

  public saveWebsiteUrl(): void {
    const value = this.website.value.trim();
    const body = {
      website: value,
    };

    this.updateOrganizationInfo(body, "website");
  }

  /**
   * @desc remove the link to the organization’s website
   */

  public removeWebsiteUrl(): void {
    const body = {
      website: "",
    };

    this.updateOrganizationInfo(body, "website");
  }

  public cancelLocation() {
    this.location.setValue(this.organization.address.full_address);
    this.isEditLocation = !this.isEditLocation;
  }

  public saveLocation(): void {
    if (this.location.hasError("required")) {
      return;
    }
    const body = {
      address: {
        full_address:
          this.cityData.toString() === "[object Object]"
            ? this.organization.address.full_address
            : this.cityData,
      },
      location: {
        lat: this._latLon.lat,
        lon: this._latLon.lon,
      },
    };

    this.updateOrganizationInfo(body);
  }

  public openDialog(name: string, title): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { name, title };
    const dialogRef = this._dialog.open(MatModalComponent, dialogConfig);
  }

  public openSocialModal(): void {
    const data = this.organization;
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = data;

    this._dialog.open(SocialIconsModalComponent, dialogConfig);
  }

  public replaceEmptyFields(e): void {
    const pattern = /[a-zA-Z0-9]/gi;
    const txt = e.target.value;

    if (!txt.match(pattern)) {
      this.location.patchValue("");
    }
  }

  public resetAddress(): void {
    this.location.patchValue("");
  }

  public handleAddressChange(event): void {
    this.cityData = event.item;
    this._getLatLng(this.cityData);
  }

  public autocomplete = (
    text$: Observable<string>
  ): Observable<Array<string>> =>
    text$.pipe(
      debounceTime(200),
      switchMap((term) => {
        this._getLatLng(term);
        this.cityData = {};
        this.cityData.name = term;
        return this._googelService.searchAutocomplete(term);
      })
    );

  public resetWebsite(): void {
    this.isEditWebsite = !this.isEditWebsite;
    this.website.patchValue(this.organization.website);
  }

  public resetDescription(): void {
    this.isEditDescr = true;
    this.description.patchValue(this.organization.description);
  }

  public resetEmail(): void {
    this.isEditSecondEmail = !this.isEditSecondEmail;
    this.secondEmail.patchValue(this.organization.emails[1]);
  }

  public resetPhones(index: number): void {
    this.editPhones[index] = !this.editPhones[index];

    if (index === 0) {
      this.firstPhoneControl.patchValue(this.organization.phones[0]);
    }

    if (index === 1) {
      this.firstPhoneControl.patchValue(this.organization.phones[1]);
    }
  }

  public initHours(): void {
    for (const item in this.organization.openTimes) {
      if (this.organization.openTimes.hasOwnProperty(item)) {
        if (this.organization.openTimes[item].length) {
          let parsedBusinessItem = parseInt(item, 10) - 1;
          let parsedItem = parseInt(item, 10);

          this.businessHours[parsedBusinessItem].checked = true;
          if (this.organization.openTimes[parsedItem].length > 1) {
            const openTimes = this.organization.openTimes[parsedItem];
            this.businessHours[parsedBusinessItem].hours = JSON.parse(
              JSON.stringify(openTimes)
            );
            this.businessHours[parsedBusinessItem].isPlus = true;
          } else {
            const openTimes = this.organization.openTimes[parsedItem][0];
            this.businessHours[parsedBusinessItem].hours[0] = JSON.parse(
              JSON.stringify(openTimes)
            );
            this.businessHours[parsedBusinessItem].isPlus = false;
          }
        } else {
          let onlyBusinessItem = parseInt(item, 10) - 1;
          this.businessHours[onlyBusinessItem].checked = false;
        }
      }
    }
    this.availableHours.forEach((item) => {
      item.name === this.organization.open_times_checkbox
        ? (item.checked = true)
        : (item.checked = false);
    });
    this.isEditHours = true;
  }

  public resetInitialTime(ev, i, isPlus: any = { item: false }) {
    if (ev.checkboxValue !== null && !ev.checkboxValue) {
      if (isPlus.item) {
        isPlus.item.isPlus = !isPlus.item.isPlus;
        this.businessHours[i].hours[1] = {
          start: "18:00",
          end: "19:00",
        };
      } else {
        this.businessHours[i].hours = [
          {
            start: "09:00",
            end: "17:00",
          },
          {
            start: "18:00",
            end: "19:00",
          },
        ];
      }
    }
  }

  public openChanged(ev) {
    this.isClosed = ev;
  }

  private _getLatLng(placeName: string): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: placeName }, (val) => {
      if (val && val.length > 0) {
        this._latLon = {
          lat: val[0].geometry.location.lat(),
          lon: val[0].geometry.location.lng(),
        };
      }
    });
  }
}
