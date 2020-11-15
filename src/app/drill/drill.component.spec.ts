import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DrillComponent } from './drill.component';

describe('DrillComponent', () => {
  let component: DrillComponent;
  let fixture: ComponentFixture<DrillComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DrillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
