import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { CommonDialogComponent } from './common-dialog.component';

class MatDialogRefStub {
  close(_result?: any): void {}
}

describe('CommonDialogComponent', () => {
  let component: CommonDialogComponent;
  let fixture: ComponentFixture<CommonDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommonDialogComponent],
      providers: [{ provide: MatDialogRef, useClass: MatDialogRefStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
