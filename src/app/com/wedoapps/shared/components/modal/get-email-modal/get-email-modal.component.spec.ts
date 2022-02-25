import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetEmailModalComponent } from './get-email-modal.component';

describe('GetEmailModalComponent', () => {
  let component: GetEmailModalComponent;
  let fixture: ComponentFixture<GetEmailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetEmailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetEmailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
