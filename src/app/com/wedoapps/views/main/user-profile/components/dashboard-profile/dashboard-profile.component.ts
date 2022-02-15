import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";

import { ValidatorHelper } from "../../../../../helpers/validator.helper";
import { UserModel } from "../../../../../models";
import { GoogleApiService } from "../../../../../services";
import { debounceTime, switchMap } from "rxjs/operators";
import { Observable } from "rxjs";
import { CalendarConstants } from "../../../../../constants/calendar.constants";

declare const gapi: any;

@Component({
  selector: "app-dashboard-profile",
  templateUrl: "./dashboard-profile.component.html",
  styleUrls: ["./dashboard-profile.component.scss"],
})
export class DashboardProfileComponent implements OnInit, OnChanges {
  @Input()
  public followUsers: UserModel[];
  @Input()
  public user: UserModel;
  @Input()
  public isFollowerPage: boolean;
  @Output()
  public userData: EventEmitter<any> = new EventEmitter<any>();

  public auth2;
  public profileForm: FormGroup;
  public isEditable: boolean = true;
  public cityData: any = {}; // get datas from google api for city location
  private calendarDay: number;
  public maxDate = new Date();
  public defDate: Date = new Date(
    new Date().getFullYear() - 10,
    new Date().getMonth(),
    new Date().getDate()
  );
  public dateRange: string = `${new Date().getFullYear() - 100}:${
    new Date().getFullYear() - 8
  }`;

  public isLoading: boolean;
  private _latLon: any;
  public calendarSettings = CalendarConstants.SETTINGS;

  constructor(
    private fb: FormBuilder,
    private _googelService: GoogleApiService
  ) {
    const nonWhitespaceRegExp: RegExp = new RegExp("\\S");
    this.profileForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.pattern(ValidatorHelper.NAME_REGEXP),
          Validators.pattern(nonWhitespaceRegExp),
        ],
      ],
      surname: [
        "",
        [
          Validators.required,
          Validators.pattern(ValidatorHelper.NAME_REGEXP),
          Validators.pattern(nonWhitespaceRegExp),
        ],
      ],
      email: ["", Validators.required],
      gender: [{ value: "", disabled: this.isEditable }, Validators.required],
      dob: [
        { value: "", disabled: this.isEditable },
        [Validators.required, ValidatorHelper.DateValidator()],
      ],
      address: this.fb.group({
        full_address: [""],
      }),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === "user" && this.user) {
        const gender = this.profileForm.get("gender"),
          dob = this.profileForm.get("dob");

        gender.disable();
        dob.disable();
        if (!this.isEditable) {
          this.isEditable = !this.isEditable;
        }
        this.isLoading = false;
        this.setFormValues();
      }
    }
  }

  ngOnInit() {}
  public daySelected(event): void {
    this.calendarDay = new Date(event).getDate();
  }
  public monthSelected(event): void {
    if (this.calendarDay) {
      const date = `${event.month.toString()}/${this.calendarDay.toString()}/${event.year.toString()}`;
      this.profileForm.get("dob").patchValue(new Date(date));
    }
  }
  public chosenYearHandler(event): void {
    this.profileForm.get("dob").patchValue(event);
  }

  public chosenMonthHandler(event): void {
    this.profileForm.get("dob").patchValue(event);
  }
  public editInfo(): void {
    const gender = this.profileForm.get("gender"),
      dob = this.profileForm.get("dob");

    this.isEditable = !this.isEditable;

    if (!this.isEditable) {
      gender.enable();
      dob.enable();
    } else {
      gender.disable();
      dob.disable();
    }
  }

  public updateUserInfo(): void {
    this.isLoading = true;
    const body = {
      ...this.profileForm.getRawValue(),
      categories: [],
    };

    delete body["email"];

    this.user.categories.forEach((cat) => {
      body.categories.push(cat._id);
    });

    if (body.name.trim().length && body.surname.trim().length) {
      this.userData.emit(body);
    } else {
      this.isLoading = false;
    }
  }

  public resetForm(): void {
    this.isEditable = true;

    this.setFormValues();
  }

  public autocomplete = (
    text$: Observable<string>
  ): Observable<Array<string>> =>
    text$.pipe(
      debounceTime(200),
      switchMap((term) => {
        this._getLatLng(term);
        this.cityData.name = term;
        return this._googelService.searchAutocomplete(term);
      })
    );

  public handleAddressChange(event): void {
    this.cityData = event.item;
    this._getLatLng(this.cityData);
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

  private setFormValues(): void {
    let formattedDate;

    if (this.user.dob) {
      formattedDate = new Date(this.user["dob"]);
    }
    this.profileForm.patchValue({
      name: this.user.name,
      surname: this.user.surname,
      gender: this.user.gender || "M",
      email: this.user.email || "",
      dob: formattedDate || "",
      address: {
        full_address: this.user.address.full_address || "",
      },
    });
  }
}
