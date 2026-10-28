/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditQuestionnaireComponent } from './edit-questionnaire.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { QuestionnaireServiceService } from '../../services/questionnaire-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: EditQuestionnaireComponent;
let fixture: ComponentFixture<EditQuestionnaireComponent>;

const FakeQuestionnaireServiceService = {
  editQuestionnaire: (_obj: any) => of({}),
};

const FakeDataService = {
  uid: 'uid1',
  uname: 'admin',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

// answerType 'Free Text' takes the simple branch in patchSelectedQuestion,
// avoiding the need to fake a qvalues array shape.
const FakeDialogData = {
  selectedQuestion: {
    providerServiceMapID: 'ps1',
    questionID: 1,
    questionTypeID: 1,
    questionType: 'Qualitative',
    question: 'Sample question',
    questionRank: 1,
    answerType: 'Free Text',
    questionWeightage: null,
    qvalues: [],
  },
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditQuestionnaireComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: FakeDialogData },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        {
          provide: QuestionnaireServiceService,
          useValue: FakeQuestionnaireServiceService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(EditQuestionnaireComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('EditQuestionnaireComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
