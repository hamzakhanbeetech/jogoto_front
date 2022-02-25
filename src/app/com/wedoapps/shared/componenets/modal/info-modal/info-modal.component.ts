import {Component, Inject, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent implements OnInit, AfterViewInit {
  public loading: boolean = false;
  public errorMessage: string = undefined;
  public invitedEmailsList: Array<string> = [];
  public email: string
  public events = []
  public texts: any

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private _dialog: MatDialog,
              private ref: ChangeDetectorRef) {

                console.log("const dataaa ", this.data)

                if(this.data.header){
                  this.texts = this.data
                }
                setTimeout(() => {
                  this.ngOnInit()

                },100)
  }

  ngOnInit() {

    console.log("int dataaa ", this.data)
    if(this.data.events){
      this.events = this.data.events
    }

    if(this.data.header){
      this.texts = this.data
    }
    this.ref.detectChanges();

  }


  ngAfterViewInit() {

    if(this.data.header){
      this.texts = this.data
    }
  }

  public closeModal(){
    this._dialog.closeAll()
  }



  ngOnDestroy() {
  }

}
