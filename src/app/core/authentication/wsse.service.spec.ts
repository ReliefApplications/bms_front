import { TestBed, inject } from '@angular/core/testing';

import { WsseService } from './wsse.service';

describe('WsseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WsseService]
    });
  });

  it('should be created', inject([WsseService], (service: WsseService) => {
    expect(service).toBeTruthy();
  }));
});
