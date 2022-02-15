import { Component, OnDestroy, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  Route,
  RoutesRecognized,
} from "@angular/router";
import { Subscription } from "rxjs";
import {
  SubjectsInteractionsService,
  UserService,
  UtilitesService,
} from "./com/wedoapps/services";
import { Title, Meta } from "@angular/platform-browser";
import { Location } from "@angular/common";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnDestroy, OnInit {
  private _routerSubscription: Subscription = new Subscription();

  constructor(
    private translate: TranslateService,
    private _subjectsIteractionsService: SubjectsInteractionsService,
    private _userService: UserService,
    private utilitesService: UtilitesService,
    private titleService: Title,
    private metaService: Meta,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.translate.setDefaultLang("en");
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects == "/") {
          const localisedRoute = this.utilitesService.localizeRouter("/");
          this.router.navigate([localisedRoute]);
        }
      }
    });

    let tagData: any = {};
    this._subjectsIteractionsService.pageTags.subscribe((data) => {
      tagData = data;
      this.setTags(tagData);
    });
    this.translate.onLangChange.subscribe(() => {
      if (tagData.title) {
        this.setTags(tagData);
      }
    });
    this._checkNavigation();
  }

  ngOnInit() {
    let lang =
      localStorage.getItem("currentLanguage") ||
      navigator.language ||
      this.translate.currentLang;

    if (lang === "fr") {
      this.translate.use(lang);
    } else {
      lang = "en";
      this.translate.use(lang);
    }
    localStorage.setItem("currentLanguage", lang);
    const path = this.location.path().substring(0, 3);
    if (!path) {
      if (!!lang) {
        this.translate.use(lang);
      } else {
        lang = "en";
        localStorage.setItem("currentLanguage", lang);
        this.translate.use(lang);
      }
      this.location.replaceState(`/${lang}`);
    } else {
      const urlLang = path.substring(1);
      let rowUrl = this.location.path();
      const url = rowUrl.replace(/\/(fr|en)\/?/gm, "");
      if ((urlLang == "en" || urlLang == "fr") && urlLang !== lang) {
        lang = urlLang;
        localStorage.setItem("currentLanguage", urlLang);
        this.translate.use(urlLang);
      } else if (
        rowUrl.length > 3 &&
        (rowUrl.substring(1, 3) !== "en" || rowUrl.substring(1, 3) !== "fr")
      ) {
        this.router.navigateByUrl(
          this.utilitesService.localizeRouter(url, lang)
        );
      }
    }
    if (this._subjectsIteractionsService.checkUserState()) {
      const body = {
        lang,
      };
      this._userService.changeAppLang(body).subscribe((data: any) => {});
    }
  }

  public setTags(data) {
    if (data.title || data.desc) {
      this.translate
        .get([data.title, data.desc])
        .subscribe((translated: string) => {
          if (!data.name) {
            this.titleService.setTitle(translated[data.title] + " - Jogoto");
            this.metaService.updateTag({
              name: "description",
              content: translated[data.desc],
            });
          } else {
            const desc = `${translated[data.title]} ${data.name} ${
              translated[data.desc]
            }`;
            const title = `${data.name} - ${this.translate.instant(
              "tags.author"
            )}`;
            this.titleService.setTitle(title);
            this.metaService.updateTag({ name: "description", content: desc });
          }
        });
    }
    this.metaService.updateTag({
      name: "apple-itunes-app",
      content: "app-id=1470596716",
    });
  }

  private _checkNavigation(): void {
    this._routerSubscription = this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        const ind = this.router.url.indexOf("/search");
        const distanceIndex = this.router.url.indexOf("distance");
        if (ind === -1) {
          window.scrollTo(0, 0);
        } else if (ind !== -1 && distanceIndex === -1) {
          // window.scrollTo(0, 0);
        }
        return;
      }
    });
  }

  ngOnDestroy() {
    this._routerSubscription.unsubscribe();
  }
}
