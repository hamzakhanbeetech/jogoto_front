import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-onboarding-footer',
  templateUrl: './onboarding-footer.component.html',
  styleUrls: ['./onboarding-footer.component.scss']
})
export class OnboardingFooterComponent implements OnInit {
  public year = new Date().getFullYear();
  constructor() { }

  ngOnInit() {
  }

}
