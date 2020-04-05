import { TestBed } from '@angular/core/testing';

import { WukongRangeDatepickerService } from './wukong-range-datepicker.service';

describe('WukongRangeDatepickerService', () => {
  let service: WukongRangeDatepickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WukongRangeDatepickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
