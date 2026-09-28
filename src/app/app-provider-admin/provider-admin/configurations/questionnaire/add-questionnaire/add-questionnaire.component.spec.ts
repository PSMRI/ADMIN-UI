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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddQuestionnaireComponent } from './add-questionnaire.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { AgentListCreationService } from '../../services/agent-list-creation-service.service';
import { QuestionnaireServiceService } from '../../services/questionnaire-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: AddQuestionnaireComponent;
let fixture: ComponentFixture<AddQuestionnaireComponent>;

const FakeQuestionnaireServiceService = {
  getServices: (_userID: any) => of([]),
  getQuestionTypes: () => of([]),
  fetchQuestionnaire: (_obj: any) => of({ statusCode: 200, data: [] }),
  saveQuestionnaire: (_list: any) =>
    of({ statusCode: 200, data: { response: 'ok' } }),
  deleteQuestionaire: (_obj: any) =>
    of({ statusCode: 200, data: { response: 'ok' } }),
  editQuestionnaire: (_obj: any) => of({}),
};

const FakeDataService = {
  uid: 'uid1',
  uname: 'admin',
};

const FakeAgentListCreationService = {
  getStates: (_userID: any, _serviceID: any, _isNational: any) =>
    of({ data: [] }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeMatDialog = {};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddQuestionnaireComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: QuestionnaireServiceService,
          useValue: FakeQuestionnaireServiceService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: AgentListCreationService,
          useValue: FakeAgentListCreationService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MatDialog, useValue: FakeMatDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(AddQuestionnaireComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('AddQuestionnaireComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
