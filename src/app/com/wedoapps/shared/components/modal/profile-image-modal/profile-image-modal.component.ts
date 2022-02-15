import {Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {CropperPosition, ImageCropperComponent} from 'ngx-image-cropper';
import {UtilitesService} from '../../../../services';
import {SendInfoToAlertMessage} from '../../../../models/global.models';
import {Poster} from '../../../../views/main/basic/create-event/create-event.models';

@Component({
    selector: 'app-profile-image-modal',
    templateUrl: './profile-image-modal.component.html',
    styleUrls: ['./profile-image-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProfileImageModalComponent implements OnInit {
    @ViewChild(ImageCropperComponent, { static: false }) imageCropper: ImageCropperComponent;
    @ViewChild('uploadInput', { static: false }) uploadInput: ElementRef;
    public imageChangedEvent: any = '';
    public image: string = '';
    private alertData: SendInfoToAlertMessage = {} as SendInfoToAlertMessage;
    private isSuccessful: boolean = true;
    public original: string;
    public unCropped = {
        data: '',
        width: 0,
        height: 0
    };
    public cropperPositionReady: CropperPosition = {} as CropperPosition;
    public isFirstDefault: boolean;
    public showError: boolean;
    public loading: boolean = true;
    public cropperReady: boolean;
    private isCropped: boolean = true;
    public isUploaded: boolean;
    public errMess: string = 'delete_error';
    private fileName: string = 'default';
    private fileType: string = 'image/jpeg';
  private needRotation: boolean = false;


  constructor(public dialogRef: MatDialogRef<ProfileImageModalComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private _utilitiesService: UtilitesService) {
        this._utilitiesService.cropToBlob();
    }

    ngOnInit() {
        this.unCropped.width = this.data.original.width;
        this.unCropped.height = this.data.original.height;
        if (this.data.cropped.width == this.data.original.width &&
            this.data.cropped.height == this.data.original.height) {
            this.original = this.data.cropped.link;
            this.isFirstDefault = true;
            this.loading = false;
            this.cropperReady = true;
            this.isCropped = false;
        } else {
            this._getBase64(this.data.original.link, false);
        }
    }

    private _getBase64(url: string, isCrop: boolean = true) {
        this.loading = true;
        this._utilitiesService.getImage(url)
            .subscribe((base64: Blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(base64);
                reader.onloadend = () => {
                    this.original = reader.result.toString();
                    this.unCropped.data = reader.result.toString();
                    this.loading = false;
                };
            });
    }

    public uploadProfilePhoto(data): void {
        this.isUploaded = true;
        const file = data.target.files[0];
        this.loading = true;
        if (data.target.files && file) {
            if (file.type && file.type.split('/')[1] == ['png'] ||
                file.type.split('/')[1] == ['gif'] ||
                file.type.split('/')[1] == ['jpeg'] ||
                file.type.split('/')[1] == ['jpg']) {
                if (file.type.split('/')[0] == ['image'] && file.size <= 16144000) {
                  let orientation = -1;
                  this._utilitiesService.getOrientation(data.target.files[0], (res) => {
                    orientation = res;
                    this.needRotation = orientation == 8 || orientation == 3 || orientation == 6;
                  });
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    this.fileType = data.target.files[0].type;
                    this.fileName = data.target.files[0].name;
                    reader.onloadend = (event: any) => {
                        const image = new Image();
                        image.src = reader.result.toString();
                        const body = {
                            image: reader.result
                        };
                        image.onload = (a) => {
                            const height = image.height;
                            const width = image.width;
                          if (width > 110 && height > 110) {
                            this.isFirstDefault = false;
                            this.unCropped.width = width;
                            this.unCropped.height = height;
                            this.unCropped.data = image.src;
                            this.imageChangedEvent = image.src;
                            this.isSuccessful = true;
                            this._setCropper(width / 2 - 100,
                              width / 2 + 100,
                              height / 2 - 100,
                              height / 2 + 100);
                            this.showError = false;
                          } else {
                            this.imageChangedEvent = this.unCropped.data;
                            this._setErr('user.width_err');
                          }
                          this.loading = false;
                        };
                    };
                } else {
                    this.loading = false;
                    this._setErr('user.size_err');
                }
            } else {
                this.loading = false;
                this._setErr('user.type_err');
            }
        }
    }

    public imageCropped(data: any): void {
        const poster: Poster = {cropped: {}, original: {}} as Poster;
        poster.cropped.data = data.base64;
        poster.cropped.height = data.height;
        poster.cropped.width = data.width;
        poster.cropped.x = data.cropperPosition.x1;
        poster.cropped.x2 = data.cropperPosition.x2;
        poster.cropped.y = data.cropperPosition.y1;
        poster.cropped.y2 = data.cropperPosition.y2;
        poster.original.data = this.unCropped.data;
        poster.original.height = this.unCropped.height;
        poster.original.width = this.unCropped.width;
        poster.type = 'image';
        const body = {
            cropped: poster,
            success: this.isSuccessful,
            alertData: this.alertData,
            type: this.fileType,
            fileName: this.fileName
        };
        if (data.cropperPosition.y2 === this.data.cropped.y2 &&
            data.cropperPosition.x2 === this.data.cropped.x2 &&
            !this.isUploaded) {
            this.dialogRef.close();
        } else {
            this.dialogRef.close(body);
        }
    }

    public save() {
        if(this.imageCropper){
            this.imageCropper.crop();
        }else {
            this.dialogRef.close();
        }
    }

    public cancel() {
        this.isUploaded = false;
        this.uploadInput.nativeElement.value = null;
        this.unCropped.data = this.original;
        this.showError = false;
        this.isFirstDefault = !this.isCropped;
    }

    public changeCropper() {
        if (!this.isFirstDefault && this.data.cropped.x && !this.isUploaded) {
            if(!this.data.cropped.x2 &&
               !this.data.cropped.y2){
                this._setCropper(71,182,97,208)
            }else{
                this._setCropper(
                    this.data.cropped.x,
                    this.data.cropped.x2,
                    this.data.cropped.y,
                    this.data.cropped.y2);
            }
        }

        if (this.showError) {
            this._setCropper(
                this.data.cropped.x,
                this.data.cropped.x2,
                this.data.cropped.y,
                this.data.cropped.y2);
        }
        this.cropperReady = true;
    }

  public imageLoaded(){
    if(this.needRotation){
      this.imageCropper.rotateLeft();
      this.needRotation = false
    }
  }


    private _setCropper(x: number, x2: number, y: number, y2: number) {
        this.cropperPositionReady = {
            x1: x,
            x2: x2,
            y1: y,
            y2: y2
        };
    }

    private _setErr(mess) {
        this.showError = true;
        this.isSuccessful = false;
        this.errMess = mess;
        this.alertData.type = 'error';
        this.alertData.messageText = 'The profile picture should be a PNG, JPG, or GIF file under 6 MB in size. For best quality, your profile picture should be at least 320 pixels wide and 320 pixels tall.';
    }

    loadImageFailed() {
    }
}
