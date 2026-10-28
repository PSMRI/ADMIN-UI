import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AddFieldsService } from './add-fields-service';

describe('AddFieldsService', () => {
  let service: AddFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AddFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
