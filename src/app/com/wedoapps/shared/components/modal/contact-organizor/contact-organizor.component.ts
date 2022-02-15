import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie";
import { DeleteService, UtilitesService } from "src/app/com/wedoapps/services";

@Component({
  selector: "app-contact-organizor",
  templateUrl: "./contact-organizor.component.html",
  styleUrls: ["./contact-organizor.component.scss"],
})
export class ContactOrganizorComponent implements OnInit {
  public texts: any;
  public loading: boolean = false;
  public errorText: string;
  email: string = null;
  phones: [string] = null;
  constructor(
    public dialogRef: MatDialogRef<ContactOrganizorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _router: Router,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.texts = this.dialogRef.componentInstance.data.organizerTexts;
    this.email = this.dialogRef.componentInstance.data.email;
    this.phones = this.dialogRef.componentInstance.data.phones;
  }

  callOrganizer(event): void {
    console.log(event);
  }

  mailOrganizer(event): void {
    console.log(event);
  }
}
