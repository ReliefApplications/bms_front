import { TestBed, inject } from '@angular/core/testing';

import { BeneficiariesService } from './beneficiaries.service';

describe('BeneficiariesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BeneficiariesService]
    });
  });

  it('should be created', inject([BeneficiariesService], (service: BeneficiariesService) => {
    expect(service).toBeTruthy();
  }));
});
