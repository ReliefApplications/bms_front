import { TestBed, async, inject } from '@angular/core/testing';

import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionsGuard]
    });
  });

  it('should ...', inject([PermissionsGuard], (guard: PermissionsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
