import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivancyPolicyComponent } from './privancy-policy.component';

describe('PrivancyPolicyComponent', () => {
  let component: PrivancyPolicyComponent;
  let fixture: ComponentFixture<PrivancyPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivancyPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivancyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
