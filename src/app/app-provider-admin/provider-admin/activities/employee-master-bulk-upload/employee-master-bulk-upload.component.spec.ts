import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMasterBulkUploadComponent } from './employee-master-bulk-upload.component';

describe('EmployeeMasterBulkUploadComponent', () => {
  let component: EmployeeMasterBulkUploadComponent;
  let fixture: ComponentFixture<EmployeeMasterBulkUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeMasterBulkUploadComponent],
    });
    fixture = TestBed.createComponent(EmployeeMasterBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
