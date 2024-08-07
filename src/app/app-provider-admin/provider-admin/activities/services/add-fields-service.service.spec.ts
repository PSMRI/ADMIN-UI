import { TestBed } from '@angular/core/testing';

import { AddFieldsServiceService } from './add-fields-service.service';

describe('AddFieldsServiceService', () => {
  let service: AddFieldsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddFieldsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
