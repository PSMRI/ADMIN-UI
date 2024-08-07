import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFieldsToProjectComponent } from './add-fields-to-project.component';

describe('AddFieldsToProjectComponent', () => {
  let component: AddFieldsToProjectComponent;
  let fixture: ComponentFixture<AddFieldsToProjectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFieldsToProjectComponent],
    });
    fixture = TestBed.createComponent(AddFieldsToProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
