import { TestBed, inject } from '@angular/core/testing';

import { AsyncacheService } from './asyncache.service';

describe('AsyncacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsyncacheService]
    });
  });

  it('should be created', inject([AsyncacheService], (service: AsyncacheService) => {
    expect(service).toBeTruthy();
  }));
});
