import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WukongRangeDatepickerComponent } from './wukong-range-datepicker.component';

describe('WukongRangeDatepickerComponent', () => {
  let component: WukongRangeDatepickerComponent;
  let fixture: ComponentFixture<WukongRangeDatepickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WukongRangeDatepickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WukongRangeDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
