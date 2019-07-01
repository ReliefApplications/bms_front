import { TestBed } from '@angular/core/testing';

import { DistributionMarkerService } from './distribution-marker.service';

describe('DistributionMarkerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DistributionMarkerService = TestBed.get(DistributionMarkerService);
    expect(service).toBeTruthy();
  });
});
