import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {SubjectsInteractionsService, UserService} from '../../../../../services';
import {UserModel, SocialLinksModel} from '../../../../../models';

@Component({
  selector: 'app-social-icons-modal',
  templateUrl: './social-icons-modal.component.html',
  styleUrls: ['./social-icons-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SocialIconsModalComponent implements OnInit {
  public isLoading: boolean;

  public fbPattern: RegExp = /(?:http|https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\//;
  public inPattern: RegExp = /(?:http|https?:\/\/)?(?:www\.)?(?:linkedin)\.(?:com)\//;
  public igPattern: RegExp = /(?:http|https?:\/\/)?(?:www\.)?(?:instagram)\.(?:com)\//;
  public twPattern: RegExp = /(?:http|https?:\/\/)?(?:www\.)?(?:twitter)\.(?:com)\//;

  public fbControl: FormControl = new FormControl('', Validators.pattern(this.fbPattern));
  public inControl: FormControl = new FormControl('', Validators.pattern(this.inPattern));
  public igControl: FormControl = new FormControl('', Validators.pattern(this.igPattern));
  public twControl: FormControl = new FormControl('', Validators.pattern(this.twPattern));

  constructor(public dialogRef: MatDialogRef<SocialIconsModalComponent>,
              private _userService: UserService,
              private _subjectsInteractionsService: SubjectsInteractionsService,
              @Inject(MAT_DIALOG_DATA) public data: UserModel) {
  }

  ngOnInit() {
    this.data.socialLinks.forEach(item => {
      if (item.className.includes('facebook')) {
        this.fbControl.patchValue(item.link || '');
      }
      if (item.className.includes('twitter')) {
        this.twControl.patchValue(item.link || '');
      }
      if (item.className.includes('linkedin')) {
        this.inControl.patchValue(item.link || '');
      }
      if (item.className.includes('instagram')) {
        this.igControl.patchValue(item.link || '');
      }
    });
  }

  public updateSocialLinks(): void {
    this.isLoading = !this.isLoading;
      const body: SocialLinksModel = {
      facebook: this.fbControl.value,
      linkedin: this.inControl.value,
      instagram: this.igControl.value,
      twitter: this.twControl.value
    };

    this._userService.updateOrganizationSocials(body)
      .subscribe((res) => {
          this.isLoading = !this.isLoading;
          this._subjectsInteractionsService.changeSocialLinks.next(res.data);
      }, err => {
        this.isLoading = !this.isLoading;
        console.log(err);
      });
  }

  public checkFields(): boolean {
    return this.fbControl.hasError('pattern') ||
      this.inControl.hasError('pattern') ||
      this.igControl.hasError('pattern') ||
      this.twControl.hasError('pattern');

  }

}
