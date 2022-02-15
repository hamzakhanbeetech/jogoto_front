import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DublicateEventModalComponent } from './dublicate-event-modal.component';

describe('DublicateEventModalComponent', () => {
  let component: DublicateEventModalComponent;
  let fixture: ComponentFixture<DublicateEventModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DublicateEventModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DublicateEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
