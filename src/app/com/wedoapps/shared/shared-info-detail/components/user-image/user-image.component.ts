import {Router} from '@angular/router';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';

import {ProfileImageModalComponent} from '../../../components/modal/profile-image-modal/profile-image-modal.component';
import {SubjectsInteractionsService, UserService, UtilitesService} from '../../../../services';
import {UpdateUserProfileImg} from '../../../../models/global.models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {UploadService} from '../../../../services/upload.service';
import {TranslateService} from "@ngx-translate/core";
import {DeleteComponent} from '../../../components/modal/delete/delete.component';

@Component({
    selector: 'app-user-image',
    templateUrl: './user-image.component.html',
    styleUrls: ['./user-image.component.scss']
})
export class UserImageComponent implements OnInit, OnChanges, OnDestroy {
    public id: string;
    public userName: string;
    public isProf: boolean = false
    public userData;
    @Input('userData') set getUserImage({poster, id, name, isProf, isFollower}){
      this.userData = poster;
      this.userName = name;
      this.isProf = isProf;
        this.id = id;
        if(!isFollower && poster){
            this._subjectInteractions.changeImageSubject.next({link:this.userData.min, hasChanged:false});
        }
    }
    @Input()
    public isFollowerPage = false;
    @Input()
    public isFollow = false;

    @Output()
    public toggleFollowType: EventEmitter<string> = new EventEmitter<string>();

    public isLoading: boolean = false;
    public imageLoading: boolean = false;
    public image:string;
    private imageData:any;

    constructor(private _userService: UserService,
                private  router: Router,
                private _subjectInteractions: SubjectsInteractionsService,
                private _dialog: MatDialog,
                private cdRef: ChangeDetectorRef,
                private _uploadService:UploadService,
                private utilitesService: UtilitesService,
                private translate: TranslateService,
                ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        for (const propName in changes) {
            if (propName === 'isFollow') {
                this.isLoading = false;
            }
        }
    }

    ngOnInit() {}

    public openUploadImageModal() {
        const dialogConfig = new MatDialogConfig();
      dialogConfig.data = this.userData;
        let dialogRef = this._dialog.open(ProfileImageModalComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(value => {
            if (value) {
                this.imageLoading = true;
                this.uploadToAmazon(value)
            }
        });
    }

    private uploadToAmazon(value: UpdateUserProfileImg){
      const body  = {
        original: value.cropped.original.data,
        cropped: value.cropped.cropped.data,
        type: 'user'
      };
      this.imageData = value;
      this._uploadService.uploadImage(body).subscribe((data)=>{
        this.imageData.cropped.cropped.data = data.data.imageName;
        this.imageData.cropped.original.data = data.data.imageName;
        this.uploadProfilePhoto(this.imageData)
      })
    }

    public uploadProfilePhoto(body: UpdateUserProfileImg): void {
        if (body.success) {
            this._userService.updateUserProfileImage(body.cropped)
                .subscribe(res => {
                    this.userData.cropped.link = '';
                    this.cdRef.detectChanges();
                    this.userData = res.data.poster;
                  this._subjectInteractions.changeImageSubject.next({link: res.data.poster.min, hasChanged: true});
                    localStorage.setItem('user_data', JSON.stringify(res.data));
                    this._subjectInteractions.errorSuccessMessag.next(
                      {
                        type: 'success',
                        messageText: this.translate.instant("image_update_mess"),
                        display: true
                      }
                    );
                });
        } else {
          this._subjectInteractions.errorSuccessMessag.next(
            {
                type: body.alertData.type,
                messageText: body.alertData.messageText,
                display: true
              }
            );
        }
    }
    public imageLoaded(){
        this.imageLoading = false;
    }

    public toggleFollow(id: string): void {
        if (this._subjectInteractions.checkUserState()) {
            this.isLoading = true;
            this.toggleFollowType.emit(id);
        } else {
          const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
          this.router.navigateByUrl(localisedUrl);
        }
    }

    public openBlockEventModal(){
        if (this._subjectInteractions.checkUserState()) {
            const dialogConfig = new MatDialogConfig();
            const type = this.isProf?'organization':'user';
            const blockTexts = {
                header: this.translate.instant(`user.block_${type}_header`),
                title: this.translate.instant(`user.block_${type}_title`),
                description: this.translate.instant(`user.block_${type}_description`, {username:this.userName}),
                button: this.translate.instant(`event.block`)
            };

            dialogConfig.data = { deleteTexts: blockTexts, id: this.id, u_id: this.id, type: 'block-users' };
            this._dialog.open(DeleteComponent, dialogConfig);
        } else {
            const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
            this.router.navigate([localisedUrl]);
        }
    }

    ngOnDestroy(){
    }
}
