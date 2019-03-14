import { TestBed } from '@angular/core/testing';

import { CustomModelService } from './custom-model.service';

describe('CustomModelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomModelService = TestBed.get(CustomModelService);
    expect(service).toBeTruthy();
  });
});
