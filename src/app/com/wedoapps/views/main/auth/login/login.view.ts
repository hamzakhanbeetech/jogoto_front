import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { CookieService } from "ngx-cookie";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from "rxjs/operators";

import { LoginService } from "./login.service";
import { LoginDataModel } from "./login.models";
import {
  ServerResponse,
  SendInfoToAlertMessage,
} from "../../../../models/global.models";
import { AppService } from "../../../../../../app.service";
import { SubjectsInteractionsService } from "../../../../services/subjects-interactions.service";
import { ValidatorHelper } from "../../../../helpers/validator.helper";
import { UtilitesService } from "../../../../services";

@Component({
  selector: "login-view",
  templateUrl: "login.view.html",
  styleUrls: ["login.view.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class LoginView implements OnInit, OnDestroy, AfterViewInit {
  public loading: boolean = false;
  public serverError: string = undefined;
  public _loginForm: FormGroup;
  private _userSubscription: Subscription = new Subscription();
  private _emailPattern = ValidatorHelper.EMAIL_REGEXP;
  public alertData: SendInfoToAlertMessage = {} as SendInfoToAlertMessage;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _loginService: LoginService,
    private _fb: FormBuilder,
    private _cookieService: CookieService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _utilitiesService: UtilitesService,
    private _appService: AppService,
    private _subjectsIteractionsService: SubjectsInteractionsService,
    private _activatedRoute: ActivatedRoute,
    private _translate: TranslateService
  ) {}

  ngOnInit() {
    this._formBuilder();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._checkQueryParams();
    }, 1000);
  }

  public userLogin(): void {
    if (this._loginForm.valid) {
      this.loading = true;
      let lang =
        localStorage.getItem("currentLanguage") || this._translate.currentLang;
      if (!lang) {
        lang = "en";
      }
      this._userSubscription = this._loginService
        .userLogin(
          this._loginForm.value.email.replace(/ /g, ""),
          this._loginForm.value.password,
          this._utilitiesService.checkDevice(),
          lang
        )
        .subscribe(
          (response: ServerResponse<LoginDataModel>) => {
            this._rememberMe(this._loginForm.value.rememberMe, {
              _id: response.data._id,
              token: response.data.token,
              type: response.data.register_type,
            });
            this.loading = false;
            this._userSubscription.unsubscribe();
            localStorage.setItem("user_data", JSON.stringify(response.data));
            this._translate.use(response.data.language);
            localStorage.setItem("currentLanguage", response.data.language);
            this._appService.setIsAuthorized(true);
            this._subjectsIteractionsService.authorization.next({
              isAuthorized: true,
            });
            this._subjectsIteractionsService.changeUserState(true);
            this._navigation(response.data);
          },
          (err: any) => {
            if (err.error) {
              this._subjectsIteractionsService.changeUserState(false);
              this.serverError = err.error.error.message;
            } else if (err.show) {
              this.serverError = err.messageText;
            }
            this._loginForm.markAsPristine();
            this.loading = false;
          }
        );
    }
  }

  private _checkQueryParams(): void {
    this._activatedRoute.queryParams.subscribe(
      (params: { emailVerified: string }) => {
        if (params && params.emailVerified) {
          if (params.emailVerified === "true") {
            this.alertData.type = "success";
            this._translate
              .get("login.message_success")
              .subscribe((translate) => {
                this.alertData.messageText = translate;
              });
            this.alertData.display = true;
            this._subjectsIteractionsService.errorSuccessMessag.next(
              this.alertData
            );
          } else {
            this.alertData.type = "error";
            this._translate
              .get("login.message_not_verified")
              .subscribe((translate) => {
                this.alertData.messageText = translate;
              });
            this.alertData.display = true;
            this._subjectsIteractionsService.errorSuccessMessag.next(
              this.alertData
            );
          }
        }
      }
    );
  }

  private _rememberMe(
    value: boolean,
    data: { _id: string; token: string; type: string }
  ) {
    const validity_days: number = 7;
    const expires: number = validity_days * 1000 * 60 * 60 * 24;
    let expires_date = null;

    if (value) {
      expires_date = new Date(new Date().getTime() + expires);
    }
    this._cookieService.put("user_id", data._id, { expires: expires_date });
    this._cookieService.put("user_token", data.token, {
      expires: expires_date,
    });
    this._cookieService.put("user_type", data.type, { expires: expires_date });
  }

  private _formBuilder(): void {
    this._loginForm = this._fb.group({
      email: new FormControl("", [
        Validators.required,
        Validators.pattern(this._emailPattern),
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
      rememberMe: new FormControl(),
    });
  }

  private _navigation(user): void {
    const queryParams = this._route.snapshot.queryParams as { event: string };

    if (queryParams && queryParams.event === "event") {
      const localisedUrl = this._utilitiesService.localizeRouter("event/");
      this._router.navigate([localisedUrl], { queryParams: queryParams });
    } else if (queryParams && queryParams.event === "group") {
      const localisedUrl =
        this._utilitiesService.localizeRouter("basic/group/");
      this._router.navigate([localisedUrl], { queryParams: queryParams });
    } else if (!user.categories || user.categories.length === 0) {
      const localisedUrl =
        this._utilitiesService.localizeRouter("/basic/interests");
      this._router.navigate([localisedUrl]);
    } else {
      const localisedUrl = this._utilitiesService.localizeRouter("/");
      this._router.navigate([localisedUrl]);
    }
  }

  public isFormValid(controlName: string): boolean {
    return (
      this._loginForm.get(controlName).invalid &&
      this._loginForm.get(controlName).touched
    );
  }

  get loginForm(): FormGroup {
    return this._loginForm;
  }

  ngOnDestroy() {
    this._userSubscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
