import { TestBed, inject } from '@angular/core/testing';

import { CsvService } from './csv.service';

describe('CsvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CsvService]
    });
  });

  it('should be created', inject([CsvService], (service: CsvService) => {
    expect(service).toBeTruthy();
  }));
});
