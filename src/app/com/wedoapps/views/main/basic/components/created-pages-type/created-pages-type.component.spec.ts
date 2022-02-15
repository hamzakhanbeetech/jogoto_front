import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedPagesTypeComponent } from './created-pages-type.component';

describe('CreatedPagesTypeComponent', () => {
  let component: CreatedPagesTypeComponent;
  let fixture: ComponentFixture<CreatedPagesTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatedPagesTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatedPagesTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
