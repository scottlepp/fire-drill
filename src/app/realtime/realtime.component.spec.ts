import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeComponent } from './realtime.component';

describe('RealtimeComponent', () => {
  let component: RealtimeComponent;
  let fixture: ComponentFixture<RealtimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
