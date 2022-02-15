import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resend-password',
  templateUrl: './resend-password.view.html',
  styleUrls: ['./resend-password.view.scss']
})
export class ResendPasswordView implements OnInit {
  public loading: boolean;
  public serverError: string;

  constructor() { }

  ngOnInit() {
  }

}