import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EmailVerificationParams} from './email-verification.models';
import {EmailVerificationService} from './email-verification.service';
import {Subscription} from 'rxjs';
import {ServerResponse, UserModel} from '../../../../models/global.models';
import {SubjectsInteractionsService, UtilitesService} from '../../../../services';

@Component({
  selector: 'email-verification-view',
  templateUrl: 'email-verification.view.html',
  styleUrls: ['email-verification.view.scss']
})
export class EmailVerificationView implements OnInit, OnDestroy {
  public loading: boolean = false;
  private _hashcode: string = '';
  private _subscription: Subscription = new Subscription();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _emailVerificationService: EmailVerificationService,
    private _router: Router,
    private _subjectsIteractionsService: SubjectsInteractionsService,
    private utilitesService: UtilitesService
  ) {
    this._checkRouteParams();
  }

  ngOnInit() {
  }

  private _checkRouteParams(): void {
    let params: EmailVerificationParams = this._activatedRoute.snapshot.params as EmailVerificationParams;
    if (params && params.hashcode) {
      this._hashcode = params.hashcode;
      this._verifyEmail(params.hashcode);
    }
  }

  private _verifyEmail(hashCode: string): void {
    this.loading = true;
    this._subscription.unsubscribe();
    const localisedUrl = this.utilitesService.localizeRouter('/auth/login');
    this._subscription = this._emailVerificationService.verifyEmail(hashCode).subscribe(
      (data: ServerResponse<UserModel>) => {
        this.loading = false;
        this._router.navigate([localisedUrl], {queryParams: {emailVerified: true}});
      },
      (error) => {
        if (error.error || error.show) {
          this.loading = false;
          this._router.navigate([localisedUrl], {queryParams: {emailVerified: false}});
        }
      });
  }


  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
