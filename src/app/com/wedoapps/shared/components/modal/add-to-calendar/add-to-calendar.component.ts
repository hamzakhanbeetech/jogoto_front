import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";

@Component({
  selector: "app-add-to-calendar",
  templateUrl: "./add-to-calendar.component.html",
  styleUrls: ["./add-to-calendar.component.scss"],
})
export class AddToCalendarComponent implements OnInit {
  public texts: any;
  constructor(public dialogRef: MatDialogRef<AddToCalendarComponent>) {}

  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }
  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
