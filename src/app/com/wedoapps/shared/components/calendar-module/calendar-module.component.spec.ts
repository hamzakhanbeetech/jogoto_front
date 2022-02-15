import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarModuleComponent } from './calendar-module.component';

describe('CalendarModuleComponent', () => {
  let component: CalendarModuleComponent;
  let fixture: ComponentFixture<CalendarModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
