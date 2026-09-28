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
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LanguageMappingComponent } from './language-mapping.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { LanguageMapping } from '../services/language-mapping.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

let component: LanguageMappingComponent;
let fixture: ComponentFixture<LanguageMappingComponent>;

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = {
  uname: 'admin',
};

const FakeLanguageMapping = {
  getUserName: (_providerId: any) => of({ data: [{ userID: '1' }] }),
  getLanguageList: () => of({ data: [{ userLangID: '1' }] }),
  getMappedLanguagesList: (_serviceProviderID: any) =>
    of({ data: [{ languageID: '1', LanguageName: 'english' }] }),
  SaveLanguageMapping: (_data: any) => of({}),
  UpdateLanguageMapping: (_data: any) => of({}),
  DeleteLanguageMapping: (_data: any) => of({}),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LanguageMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: dataService, useValue: FakeDataService },
        { provide: LanguageMapping, useValue: FakeLanguageMapping },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(LanguageMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}
describe('Language-mapping', () => {
  describe('When the component is getting loaded, then ngOnInit', () => {
    InitializeAdminTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });
    it('should be defined', () => {
      expect(component).toBeDefined();
    });
    it('checking the value of uname should not be null and should have some value username', () => {
      expect(component.createdBy).not.toBe('1');
      expect(component.createdBy).toBe('admin');
    });
    it('should set the ProviderServiceId after OnInit', () => {
      expect(component.serviceProviderID).not.toBe('');
      expect(component.serviceProviderID).toBe('serviceProviderID');
    });
    it('getUserName should be called after OnInit', () => {
      spyOn(component, 'getUserName');
      component.ngOnInit();
      expect(component.getUserName).toHaveBeenCalled();
    });
    it('getAllLanguagesList method should be called after OnInit', () => {
      spyOn(component, 'getAllLanguagesList');
      component.ngOnInit();
      expect(component.getAllLanguagesList).toHaveBeenCalled();
    });
    it('getAllMappedLanguagesList should be called after OnInit and populate LanguageMappedList', () => {
      spyOn(component, 'getAllMappedLanguagesList').and.callThrough();
      component.ngOnInit();
      expect(component.getAllMappedLanguagesList).toHaveBeenCalled();
      expect(component.LanguageMappedList).not.toEqual([]);
    });
  });
});
