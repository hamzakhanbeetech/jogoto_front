import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import {
  ImageCroppedEvent,
  CropperPosition,
  ImageCropperComponent,
} from "ngx-image-cropper";
import { Subscription, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { CreateEventService } from "../../create-event/create-event.service";
import { environment } from "../../../../../../../../environments/environment";
import {
  SubjectsInteractionsService,
  UtilitesService,
} from "../../../../../services";
import { EventModel } from "../../../../../models/global.models";

@Component({
  selector: "app-crop-image",
  templateUrl: "./crop-image.component.html",
  styleUrls: ["./crop-image.component.scss"],
})
export class CropImageComponent implements OnInit {
  @Input() info: any;
  @Input("isEdit") isEdit: boolean;
  @Input("imageLoading") imageLoading: boolean;
  public dragRepository = true;
  private _defaultImage: string | ArrayBuffer;
  public firstImage: string | ArrayBuffer;
  private _showCropperActions: boolean = false;
  private _imageChangedEvent: string = "";
  private _failedLoadImage: boolean = false;
  private _eventDublicated: Subscription = new Subscription();
  private _cropperPosition: CropperPosition;
  private _cropperPositionReady: CropperPosition;
  private _originalImage: {
    data: string | ArrayBuffer;
    width: number;
    height: number;
    orientation: number;
  };
  private _baseUrl: string = environment.BASE_URL;
  private fileName: string = "default";
  private fileType: string = "image/jpeg";
  @Output("value") private _value: EventEmitter<any> = new EventEmitter<any>();
  public loading: boolean = true;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public cropperReady: boolean = false;
  public isImageLoaded: boolean = false;
  public isSaved: boolean = false;
  public savedImage: string;
  private croppedImageData: any;
  private once: boolean = true;
  private needRotation: boolean = false;
  private orientation: number = -1;
  @ViewChild("cropper", { static: false }) imageCropper: ImageCropperComponent;

  constructor(
    private _subjectInteractionService: SubjectsInteractionsService,
    private _createEventService: CreateEventService,
    private _utilitesService: UtilitesService
  ) {
    this._utilitesService.cropToBlob();
  }

  ngOnInit() {
    this._getDefaultImage();
    this._subscribeToDuplicateEvent();
  }

  private _getDefaultImage(isDelete = false): void {
    this._getBase64FromLink(`${this._baseUrl}default.jpeg`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (res) => {
          const reader = new FileReader();
          reader.readAsDataURL(res);
          reader.onloadend = () => {
            const image = new Image();
            image.src = reader.result.toString();
            image.onload = () => {
              this._originalImage = {
                data: reader.result.toString(),
                width: image.width,
                height: image.height,
                orientation: this.orientation,
              };
              this.croppedImageData = {
                original: this._originalImage,
                type: "image",
                default_image: true,
              };
              this._defaultImage = reader.result;
              this.firstImage = reader.result;
              this._showCropperActions = false;
              if (isDelete) {
                this._value.emit({ poster: null, isSave: "delete" });
              }
              if (this.once) {
                setTimeout(() => {
                  if (!this.isEdit) {
                    this.cropperReady = true;
                    this.loading = false;
                  }
                }, 500);
                this.once = false;
              }
            };
          };
        },
        (error) => {
          alert("FAILED LOAD DEFAULT IMAGE");
        }
      );
  }

  private _getBase64FromLink(link: string): Observable<Blob> {
    return this._createEventService.getImage(link);
  }

  public resetCropper(isDelete: boolean = false): void {
    this._failedLoadImage = false;
    if (isDelete) {
      this.returnInitialState();
    }
    this._getDefaultImage(true);
    this.dragRepository = true;
  }

  public dragImage(e) {
    this.dragRepository = false;
  }

  private _subscribeToDuplicateEvent(): void {
    this.loading = true;
    this._eventDublicated =
      this._subjectInteractionService.eventCreateDuplicated
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((event: EventModel) => {
          if (!event.poster.default_image && event.poster.original.width != 0) {
            this._getBase64FromLink(event.poster.original.link)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((res) => {
                this.returnInitialState();
                const reader = new FileReader();
                reader.readAsDataURL(res);
                reader.onloadend = () => {
                  this._defaultImage = reader.result;
                  this._originalImage = {
                    width: event.poster.original.width,
                    height: event.poster.original.height,
                    data: reader.result,
                    orientation: event.poster.original.orientation,
                  };
                  if (
                    event.poster.original.orientation == 8 ||
                    event.poster.original.orientation == 3 ||
                    event.poster.original.orientation == 6
                  ) {
                    this.needRotation = true;
                  }
                  this._cropperPosition = {
                    x1: event.poster.cropped.x,
                    x2: event.poster.cropped.x2,
                    y1: event.poster.cropped.y,
                    y2: event.poster.cropped.y2,
                  };
                  this.loading = false;
                  this._showCropperActions = !event.poster.default_image;
                };
              });
            this._failedLoadImage = false;
            this.croppedImageData = {
              default_image: event.poster.default_image,
              original: {
                data: event.poster.original.link,
                width: event.poster.original.width,
                height: event.poster.original.height,
              },
              cropped: {
                data: event.poster.cropped.link,
                width: event.poster.cropped.width,
                height: event.poster.cropped.height,
                x: event.poster.cropped.x,
                y: event.poster.cropped.y,
                x2: event.poster.cropped.x2,
                y2: event.poster.cropped.y2,
              },
              type: "image",
            };
          } else {
            this.loading = false;
            this.cropperReady = true;
          }
        });
  }

  public fileChangeEvent(event: any): void {
    this.loading = true;
    this.cropperReady = false;
    this.isImageLoaded = false;
    let reader = new FileReader();
    if (event.target.files[0].type.split("/")[0] === "video") {
      reader.readAsDataURL(event.target.files[0]);
      reader.onloadend = () => {
        let video = null;
        video = reader.result;

        this._value.emit({
          poster: video,
          isSave: "save",
          type: "video",
        });
        this.loading = false;
      };
    } else {
      if (event) {
        let orientation = -1;
        this._utilitesService.getOrientation(event.target.files[0], (data) => {
          orientation = data;
          console.log(orientation);
          this.needRotation = orientation == 8 || orientation == 6;
        });
        reader.readAsDataURL(event.target.files[0]);
        this.fileType = event.target.files[0].type;
        this.fileName = event.target.files[0].name;
        reader.onloadend = () => {
          let image = new Image();
          image.src = reader.result.toString();
          image.onload = () => {
            this.orientation = orientation;
            this._originalImage = {
              data: image.src,
              width: image.width,
              height: image.height,
              orientation,
            };
            if (image.height < 132 || image.width < 250) {
              this._failedLoadImage = true;
              this._defaultImage = null;
              this.loading = false;
            } else {
              this._defaultImage = image.src;
              this._showCropperActions = true;
            }
          };
        };
      } else {
        this._failedLoadImage = true;
        this._defaultImage = null;
        this.loading = false;
      }
      // this._imageChangedEvent = event;
      this.dragRepository = true;
    }
  }

  public getCropperState() {
    this.cropperReady = true;
    this.loading = false;
  }

  public imageLoaded(): void {
    this.isImageLoaded = true;
    this._failedLoadImage = false;
    if (this.needRotation && this.orientation == 8) {
      this.imageCropper.rotateRight();
      this.needRotation = false;
    } else if (this.needRotation && this.orientation == 6) {
      this.imageCropper.rotateLeft();
      this.needRotation = false;
    }
  }

  public loadImageFailed(): void {
    this._failedLoadImage = true;
    this.loading = false;
  }

  public imageCropped(image: ImageCroppedEvent) {
    if (image.file) {
      this.fileType = image.file.type;
      this.savedImage = image.base64;
      this.croppedImageData = {
        original: this._originalImage,
        default_image: false,
        cropped: {
          data: image.base64,
          width: image.width,
          height: image.height,
          x: image.cropperPosition.x1,
          y: image.cropperPosition.y1,
          x2: image.cropperPosition.x2,
          y2: image.cropperPosition.y2,
        },
        type: "image",
        fileName: this.fileName,
        fileType: this.fileType,
      };

      this._cropperPositionReady = this.cropperPosition;
      this.isSaved = true;
      this._showCropperActions = false;
      this._value.emit({
        poster: this.croppedImageData,
        isSave: "save",
        type: "image",
      });
    }
  }

  public returnInitialState() {
    this._showCropperActions = true;
    this.isSaved = false;
  }

  public saveImage() {
    this.imageCropper.crop();
  }

  get showCropperActions(): boolean {
    return this._showCropperActions;
  }

  get imageChangedEvent(): string {
    return this._imageChangedEvent;
  }

  get failedLoadImage(): boolean {
    return this._failedLoadImage;
  }

  get defaultImage(): string | ArrayBuffer {
    return this._defaultImage;
  }

  get cropperPosition(): CropperPosition {
    return this._cropperPosition;
  }

  get cropperPositionReady(): CropperPosition {
    return this._cropperPositionReady;
  }

  ngOnDestroy() {
    this._eventDublicated.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    // this.unsubscribe$.unsubscribe();
  }
}
