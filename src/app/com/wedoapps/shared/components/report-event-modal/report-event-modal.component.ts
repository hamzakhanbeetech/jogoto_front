import {
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { EventService } from "../../../views/main/event/event.service";
import {
  ReportEventSendingDataModel,
  EventModel,
  SendInfoToAlertMessage,
} from "../../../models/global.models";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { SubjectsInteractionsService } from "../../../services";

@Component({
  selector: "app-report-event-modal",
  templateUrl: "./report-event-modal.component.html",
  styleUrls: ["./report-event-modal.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ReportEventModalComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  private _sendingText: string = "";
  private _reportEventForm: FormGroup;
  public otherReasons: boolean = false;
  public questionOfReason: string;
  public answersOfReasonQuestion: Array<string>;
  private _reportEventSubscription: Subscription = new Subscription();
  public reasonList: Array<string>;
  public reasonsWhoHaveQuestion: Array<{
    reasonName: string;
    question: string;
    answers: Array<string>;
  }>;
  public alertData: SendInfoToAlertMessage = {
    type: "success",
    messageText: "",
    display: true,
  };
  private lng = localStorage.getItem("currentLanguage");

  constructor(
    public dialogRef: MatDialogRef<ReportEventModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder,
    private _eventService: EventService,
    private _translate: TranslateService,
    private _subjectsIteractionsService: SubjectsInteractionsService
  ) {}

  ngOnInit() {
    if (this.lng === "en") {
      this.reasonList = [
        "Harassment",
        "Nudity",
        "Spam",
        "Fraud or scam",
        "Suicide or self-injury",
        "Unauthorized sales",
        "Violence",
        "Hate speech",
        "Intellectual property",
      ];

      this.reasonsWhoHaveQuestion = [
        {
          reasonName: "Harassment",
          question: "Who is being harassed?",
          answers: ["Me", "A follower"],
        },
        {
          reasonName: "Nudity",
          question: "Help us understand the problem.",
          answers: [
            "Adult nudity",
            "Sexually suggestive",
            "Sexual activity",
            "Sexual exploitation",
            "Sexual services",
            "Involves a child",
          ],
        },
        {
          reasonName: "Unauthorized sales",
          question: "Help us understand the problem.",
          answers: [
            "Buying guns or drugs",
            "Selling guns or drugs",
            "Exchanging guns or drugs",
            "Promoting drug use",
            "Something else",
          ],
        },
      ];
    } else {
      this.reasonList = [
        "Harcèlement",
        "Nudité",
        "Contenu indésirable",
        "Fraude ou arnaque",
        "Suicide ou automutilation",
        "Ventes interdites",
        "Violence",
        "Discours haineux",
        "Violation de propriété intellectuelle\n",
      ];

      this.reasonsWhoHaveQuestion = [
        {
          reasonName: "Harcèlement",
          question: "Qui est victime de harcèlement ?",
          answers: ["Moi", "Un(e) ami(e)"],
        },
        {
          reasonName: "Nudité",
          question: "Aidez-nous à comprendre le problème.",
          answers: [
            "Nudité adulte",
            "Sexuellement suggestif",
            "Actes sexuels",
            "Exploitation sexuelle",
            "Services sexuels",
            "Implique un enfant",
          ],
        },
        {
          reasonName: "Ventes interdites",
          question: "Aidez-nous à comprendre le problème.",
          answers: [
            "Acheter des armes à feu ou de la drogue",
            "Vendre des armes à feu ou de la drogue",
            "Échanger des armes à feu ou de la drogue",
            "Promouvoir la consommation de drogue",
            "Autre chose",
          ],
        },
      ];
    }
    this._formBuilder();
  }

  private _formBuilder(): void {
    this._reportEventForm = this._fb.group({
      reportEventReasons: [""],
      reasonQuestionAnswer: new FormGroup({
        answerOfQuestion: new FormControl(""),
      }),
    });

    this._reportEventForm
      .get("reportEventReasons")
      .valueChanges.subscribe((value) => {
        if (
          value === "Nudity" ||
          value === "Harassment" ||
          value === "Nudité" ||
          value === "Harcèlement" ||
          value === "Unauthorized sales" ||
          value === "Ventes interdites"
        ) {
          this._reportEventForm.get("reasonQuestionAnswer").reset();
        }
        for (let i = 0; i < this.reasonsWhoHaveQuestion.length; i++) {
          const element = this.reasonsWhoHaveQuestion[i];
          if (value === element.reasonName) {
            this.otherReasons = true;
            this.questionOfReason = element.question;
            this.answersOfReasonQuestion = element.answers;
            return;
          } else {
            this.otherReasons = false;
          }
        }
      });
    this._reportEventForm
      .get("reasonQuestionAnswer")
      .get("answerOfQuestion")
      .valueChanges.subscribe((data) => {
        console.log(data);
      });
    this._translate.get("event.report_message").subscribe((translate) => {
      this.alertData.messageText = translate;
    });
  }

  public sendReportEvent(): void {
    this.loading = true;
    const sendingData: ReportEventSendingDataModel = {
      event_id: this.data._id,
      text: this._sendingText,
    };
    this._reportEventSubscription = this._eventService
      .reportEvent(sendingData)
      .subscribe(
        (data: EventModel) => {
          this.loading = false;
          this.dialogRef.close(true);
          this._subjectsIteractionsService.errorSuccessMessag.next(
            this.alertData
          );
        },
        (err) => {}
      );
  }

  public forDisableOrNot(): boolean {
    let isValid;
    const valueForFirstReason =
      this._reportEventForm.get("reportEventReasons").value;
    const valueForSecondReason = this._reportEventForm.get(
      "reasonQuestionAnswer.answerOfQuestion"
    ).value;
    if (valueForFirstReason) {
      if (
        valueForFirstReason === "Harassment" ||
        valueForFirstReason === "Nudity" ||
        valueForFirstReason === "Nudité" ||
        valueForFirstReason === "Harcèlement" ||
        valueForFirstReason === "Unauthorized sales" ||
        valueForFirstReason === "Ventes interdites"
      ) {
        if (valueForSecondReason) {
          this._sendingText = valueForFirstReason + "-" + valueForSecondReason;
          isValid = false;
        } else {
          isValid = true;
        }
      } else {
        this._sendingText = valueForFirstReason;
        isValid = false;
      }
    } else {
      isValid = true;
    }
    return isValid;
  }

  get reportEventForm(): FormGroup {
    return this._reportEventForm;
  }

  ngOnDestroy() {
    this._reportEventSubscription.unsubscribe();
  }
}
