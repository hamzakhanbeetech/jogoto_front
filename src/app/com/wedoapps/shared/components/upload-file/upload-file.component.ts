import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UsersFileModel} from '../../../views/main/basic/create-group/create-group.models';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
  public progress: number = 0;
  public fileChoosed: boolean;
  public typeError: boolean = false;
  public file;
  public name: string;
  public stopLoad: boolean = false;
  private reader;
  @Output('value') private _value: EventEmitter<UsersFileModel> = new EventEmitter<UsersFileModel>();
  @Output('error') private _error: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('type') public type:string;

  constructor() {
  }

  ngOnInit() {
  }

  public upload(value) {
    this.file = null;
    this.progress = 0;
    this.stopLoad = false;
    const file = value.target.files[0];
    if (file) {
      const reader = new FileReader();
      this.reader = reader;
      this.name = file.name;
      const type = this.name.substring(file.name.lastIndexOf('.') + 1, file.name.length);

      if (type === 'csv' ||
        type === 'xml' ||
        type === 'xlsx' ||
        type === 'xlsm' ||
        type === 'xltm' ||
        type === 'xls') {
        this.typeError = false;
        this.fileChoosed = true;
        this.file = file;
        this.reader.readAsBinaryString(file);
      } else {
        this._error.emit(true);
        this.typeError = true;
      }

      this.reader.onabort = (e) => {
        // this.stopLoad = true;
      };

      this.reader.onprogress = (e) => {
        this.progress = Math.round(e.loaded * 100 / e.total);
      };

      this.reader.onload = (e) => {
        const binaryData = e.target.result;
        //Converting Binary Data to base 64
        this.file = window.btoa(binaryData);
        if (this.stopLoad) {
          this.file = '';
        } else {
          this._value.emit({data: this.file, extname: type, error: this.typeError});
        }
      };
    }
  }

  public stopLoading() {
    this.file = '';
    this.reader.abort();
    (<HTMLInputElement>document.getElementById('file')).value = '';
    this.name = null;
    this.fileChoosed = false;
    this.progress = 0;
    this._value.emit({data: '', extname: '', error: false});
  }

  private _checkProgress(reader, file): void {
    reader.onprogress = () => {
      return (e) => {
        this.progress = Math.round(e.loaded * 100 / e.total);
      };
    };
  }

  private _getFile(reader, file, type: string): void {
    reader.onloadend = ((theFile) => {
      return (e) => {
        const binaryData = e.target.result;
        //Converting Binary Data to base 64
        this.file = window.btoa(binaryData);
        if (this.stopLoad) {
          this.file = '';
          type = '';
        } else {
          this._value.emit({data: this.file, extname: type, error: this.typeError});
        }
      };
    })(this.file);
  }
}
