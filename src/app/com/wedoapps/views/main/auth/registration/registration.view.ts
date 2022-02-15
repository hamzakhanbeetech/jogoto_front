import {Observable, timer, Subscription, of, Subject} from 'rxjs';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {Component, OnDestroy, OnInit, NgZone} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';

import {IndividualRegistrationDatasForSending, ProfessionalRegistrationDatasForSending, BusinessTypesModel} from './registration.models';
import {ServerResponse, SendInfoToAlertMessage, UserDataModel, ServerErrorModel} from '../../../../models/global.models';
import {RegistrationService} from './registration.service';
import {GoogleApiService, SubjectsInteractionsService} from '../../../../services';
import {Router, NavigationEnd} from '@angular/router';
import {ValidatorHelper} from '../../../../helpers/validator.helper';
import {CalendarConstants} from '../../../../constants/calendar.constants';
import {TranslateService} from '@ngx-translate/core';


declare const google: any;

@Component({
    selector: 'registration-view',
    templateUrl: 'registration.view.html',
    styleUrls: ['registration.view.scss'],
})
export class RegistrationView implements OnInit, OnDestroy {
    private _individualSubscribe: Subscription = new Subscription();
    private _professionalSubscribe: Subscription = new Subscription();
    private _langSubscribe: Subscription = new Subscription();
    public activeRadioButtonName: string = 'user';
    public backendValidationError: string;
    public auth2;
    private _geocoder = new google.maps.Geocoder;
    public cityData: string = ''; // get datas from google api for city location
    private _businessTypesFromServer: BusinessTypesModel;
    public businessTypes: Array<string> = [];
    public resendPassword: boolean;
    public sendingInfo: SendInfoToAlertMessage = {
        type: 'error',
        messageText: '',
        display: true
    };
    public defDate: Date = new Date(new Date().getFullYear() - 10, new Date().getMonth(), new Date().getDate());
    public dateRange: string = `${new Date().getFullYear() - 100}:${new Date().getFullYear() - 8}`;
    private _userAddress: any; // get datas from google api for user address
    public saveEmailAddress: string;
    public loading: boolean = false;
    private _emailPattern = ValidatorHelper.EMAIL_REGEXP;
    private _cityPattern: string = '(?=.*?[A-Za-z]{2}).+';
    public userRegistration: boolean;
    public companyRegistration: boolean;
    private _registrationForm: FormGroup;
    public latLon: any;
    private calendarDay: number;
    public calendarSettings = CalendarConstants.SETTINGS;
    private businessType:string = null;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private _registrationService: RegistrationService,
                private _fb: FormBuilder,
                private _ngZone: NgZone,
                private _router: Router,
                private _googelService: GoogleApiService,
                private _translate:TranslateService,
                private _subjectsIteractionsService: SubjectsInteractionsService) {
        this.userRegistration = false;
        this.companyRegistration = false;
        this.resendPassword = false;

        this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (event.url.split('?')[0] === '/auth/registration') {
                    this.resendPassword = false;
                }

            }
        });
    }

    ngOnInit() {
        this._formBuilder();
        this._findUserLocation();
        this.maxAndMinDates();
        this._getBusinessTypes();
        this.checkLang();
    }

    private checkLang(){
        this._langSubscribe = this._subjectsIteractionsService.getCurrentLang()
            .subscribe(lang =>{
                if(lang == 'fr'){
                    this.calendarSettings = CalendarConstants.SETTINGSFr
                }else{
                    this.calendarSettings = CalendarConstants.SETTINGS
                }

                if(this.businessType){
                    this.setBusinessType(this.businessType, lang)
                }
            })
    }

    public setradio(e): void {
        this.activeRadioButtonName = e.target.value;
    }

    public filterInp = (value): boolean => {
        if (value.key) {
            return value.key.charCodeAt(0) >= 47 && value.key.charCodeAt(0) <= 57;
        }
    };

    public openCloseRegistrationType(): void {
        this._registrationForm.reset();
        this.backendValidationError = null;
        if (this.activeRadioButtonName === 'user') {
            this.userRegistration = !this.userRegistration;
            window.scrollTo(0, 0);
        } else {
            this.companyRegistration = !this.companyRegistration;
            window.scrollTo(0, 0);
        }

    }

    public chosenYearHandler(event): void {
        this._registrationForm.get('user').get('date').patchValue(event);
    }

    public chosenMonthHandler(event): void {
        this._registrationForm.get('user').get('date').patchValue(event);
    }

    public monthSelected(event): void {
        if (this.calendarDay) {
            const date = `${event.month.toString()}/${this.calendarDay.toString()}/${event.year.toString()}`;
            this._registrationForm.get('user.date').patchValue(new Date(date));
        }
    }

    public daySelected(event): void {
        this.calendarDay = new Date(event).getDate();
    }

    private _findUserLocation(): void {
        navigator.geolocation.getCurrentPosition((position: Position) => {
            this.latLon = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            this._findPlaceByCoordinates(position.coords.latitude, position.coords.longitude);
        });
    }

    private _findPlaceByCoordinates(lat: number, lng: number): void {
        const latlng = {lat: lat, lng: lng};

        this._geocoder.geocode({'location': latlng}, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    this._ngZone.run(() => {
                        this._userAddress = results[0];
                    });
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    private _getLatLng(placeName: string): void {
        let geocoder = new google.maps.Geocoder;
        geocoder.geocode({address: placeName}, (val) => {
            if (val && val.length > 0) {
                this.latLon = {
                    lat: val[0].geometry.location.lat(),
                    lon: val[0].geometry.location.lng()
                };
            }
        });
    }

    private _formBuilder(): void {
      this._registrationForm = this._fb.group({
            user: this._fb.group({
                email: new FormControl('', [Validators.required, Validators.pattern(this._emailPattern), Validators.maxLength(100)]),
                firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( ValidatorHelper.NAME_REGEXP )]),
                lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern( ValidatorHelper.NAME_REGEXP )]),
                date: new FormControl('', Validators.required),
                gender: new FormControl('', Validators.required),
                password: new FormControl('', [Validators.required, Validators.minLength(6)]),
                repeatPassword: new FormControl('', Validators.required)
            }, {validator: this._matchingPasswords('password', 'repeatPassword')}),
            company: this._fb.group({
                businessType: new FormControl('public', Validators.required),
                townHall: new FormControl('', Validators.required),
                email: new FormControl('', [Validators.required, Validators.pattern(this._emailPattern), Validators.maxLength(100)]),
                city: new FormControl('', [Validators.required, Validators.pattern(this._cityPattern)]),
                nameOfOrganization: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]),
                password: new FormControl('', [Validators.required, Validators.minLength(6)]),
                repeatPassword: new FormControl('', Validators.required)
            }, {validator: this._matchingPasswords('password', 'repeatPassword')})
        });
        this._registrationForm.get('company.businessType').valueChanges.subscribe((data) => {
            this.businessType = data;
            this.setBusinessType(this.businessType, this._translate.currentLang)
        });

        this._registrationForm.get('company.city').valueChanges.subscribe((data) => {
            if (data && data.trim() !== this.cityData.trim()) {
                this._registrationForm.get('company.city').setErrors({
                    'notUnique': true
                });
            }

        });
    }

    private setBusinessType(data, lang){
        if (data === 'public') {
            this.businessTypes = this._businessTypesFromServer[lang].public;
            this._registrationForm.get('company.townHall').reset();
        } else if (data === 'business') {
            this.businessTypes = this._businessTypesFromServer[lang].professional;
            this._registrationForm.get('company.townHall').reset();
        }
    }

    private _matchingPasswords(passwordKey: string, confirmPasswordKey: string, isUser:boolean = false) {
        return (group: FormGroup): { [key: string]: any } => {
            let password = group.controls[passwordKey];
            let confirmPassword = group.controls[confirmPasswordKey];

            if ((password.value !== confirmPassword.value) && password.dirty && confirmPassword.dirty) {
                return {
                    mismatchedPasswords: true
                };
            }
        };
    }

    public checkInputsRightOrNot(formGroupName, inputName): boolean {
        return this._registrationForm.get(`${formGroupName}.${inputName}`).invalid && this._registrationForm.get(`${formGroupName}.${inputName}`).touched;
    }

    public signUpForIndividualUser(): void {
        if (!this._registrationForm.get('user').invalid) {
            this.loading = true;
            const sendingData: IndividualRegistrationDatasForSending = {
                name: this._registrationForm.get('user.firstName').value.trim(),
                surname: this._registrationForm.get('user.lastName').value.trim(),
                dob: this._registrationForm.get('user.date').value,
                email: this._registrationForm.get('user.email').value.replace(/ /g, ''),
                password: this._registrationForm.get('user.password').value,
                gender: this._registrationForm.get('user.gender').value,
                user_register_type: 'web',
                lang:this._translate.currentLang
            };
            if (this._userAddress) {
                sendingData.location = {
                    lat: this._userAddress.geometry.location.lat(),
                    lon: this._userAddress.geometry.location.lng()
                };
                sendingData.address = {
                    full_address: this._userAddress.formatted_address
                };
            }

            this._individualSubscribe = this._registrationService.individualRegistration(sendingData).subscribe((data: ServerResponse<UserDataModel>) => {
                this.loading = false;
                window.scrollTo(0, 0);
                this.resendPassword = true;
                this.saveEmailAddress = this._registrationForm.get('user.email').value.replace(/ /g, '');
                this.userRegistration = false;
                this.companyRegistration = false;
                this.sendingInfo = {
                    type: 'success',
                    messageText: `${this._translate.instant('registration.success_mess')} ${this.saveEmailAddress}`,
                    display: true
                };
                this._subjectsIteractionsService.errorSuccessMessag.next(this.sendingInfo);
            }, (err: any) => {
                if (err.error) {
                    this.backendValidationError = err.error.error.message;
                } else if (err.show) {
                    this.backendValidationError = err;
                }
                this.loading = false;
            });
        }
    }

    public handleAddressChange(event): void {
        this.cityData = event.item;
        this._getLatLng(this.cityData);
    }

    public autocomplete = (text$: Observable<string>): Observable<Array<string>> =>
        text$.pipe(
            debounceTime(200),
            switchMap(term => {
                if (!term.trim().length) {
                    this._registrationForm.get('company.city').setErrors({'required': false});
                    return of([]);
                }
                this._getLatLng(term);
                this.cityData = term;
                return this._googelService.searchAutocomplete(term);
            })
        );

    public signUpForProfessionalUser(): void {
        if (!this._registrationForm.get('company').invalid) {
            this.loading = true;
            const sendingData: ProfessionalRegistrationDatasForSending = {
                name: this._registrationForm.get('company.nameOfOrganization').value,
                email: this._registrationForm.get('company.email').value.replace(/ /g, ''),
                category: this._registrationForm.get('company.townHall').value,
                type: this._registrationForm.get('company.businessType').value,
                password: this._registrationForm.get('company.password').value,
                user_register_type: 'web',
                location: this.latLon,
                lang:this._translate.currentLang,
                address: {
                    full_address: this.cityData
                }
            };

            this._professionalSubscribe = this._registrationService.professionalRegistration(sendingData).subscribe((data: ServerResponse<UserDataModel>) => {
                this.loading = false;
                window.scrollTo(0, 0);
                this.sendingInfo = {
                    type: 'success',
                    messageText: `${this._translate.instant('registration.success_mess')} ${this._registrationForm.get('company.email').value.replace(/ /g, '')}`,
                    display: true
                };
                this._subjectsIteractionsService.errorSuccessMessag.next(this.sendingInfo);
                timer(3500).subscribe(() => {
                    this.resendPassword = true;
                    window.scrollTo(0, 0);
                    const email  = this._registrationForm.get('user.email').value || this._registrationForm.get('company.email').value;
                    this.saveEmailAddress = email.replace(/ /g, '');
                    this.userRegistration = false;
                    this.companyRegistration = false;
                });

            }, (err: any) => {
                this.loading = false;
                if (err.error) {
                    this.backendValidationError = err.error.error.message;
                } else if (err.show) {
                    this.backendValidationError = err;
                }
                this.loading = false;
            });
        }

    }

    public maxAndMinDates(): void {
        // this.maxDate = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate());
        // this.minDate = new Date(1919, 0, 1);
    }

    private _getBusinessTypes(): void {
        this._registrationService.getBusinessTypes().subscribe((response: ServerResponse<BusinessTypesModel>) => {
            this._businessTypesFromServer = response.data;
            // this.businessTypes = response.data.public;
        });
    }

    get registrationForm(): FormGroup {
        return this._registrationForm;
    }

    ngOnDestroy() {
        this._individualSubscribe.unsubscribe();
        this._professionalSubscribe.unsubscribe();
        this._langSubscribe.unsubscribe();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
