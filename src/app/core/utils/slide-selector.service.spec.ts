import { TestBed } from '@angular/core/testing';

import { SlideSelectorService } from './slide-selector.service';

describe('SlideSelectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SlideSelectorService = TestBed.get(SlideSelectorService);
    expect(service).toBeTruthy();
  });
});
