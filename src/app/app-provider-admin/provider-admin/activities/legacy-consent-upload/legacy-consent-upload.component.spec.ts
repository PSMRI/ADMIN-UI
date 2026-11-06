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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import { MaterialModule } from 'src/app/core/material.module';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigurationService,
  LegacyBatch,
} from '../services/consent-configuration.service';
import {
  LEGACY_COLUMNS,
  LegacyConsentUploadComponent,
  reasonText,
} from './legacy-consent-upload.component';

/** A sheet as the browser would read it from a file. */
function sheetData(rows: unknown[][]): ArrayBuffer {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), 'S');
  return XLSX.write(book, { type: 'array', bookType: 'xlsx' });
}

const GOOD = ['101', '2025-06-14', 'P-REG;P-TRT', 'hi', 'PAPER', '', '', ''];

function checked(): LegacyBatch {
  return {
    batchId: 'lb-1',
    fileName: 'old.xlsx',
    uploadedBy: 'padmin1',
    uploadedAt: '2026-11-02T10:00:00+05:30',
    total: 2,
    valid: 1,
    imported: 0,
    skipped: 0,
    failed: 1,
    rows: [
      { rowNo: 2, beneficiaryId: '101', status: 'VALID', reasons: [] },
      {
        rowNo: 3,
        beneficiaryId: '9',
        status: 'ERROR',
        reasons: ['UNKNOWN_BENEFICIARY', 'MISSING:mode'],
      },
    ],
  };
}

describe('LegacyConsentUploadComponent', () => {
  let fixture: ComponentFixture<LegacyConsentUploadComponent>;
  let component: LegacyConsentUploadComponent;
  let service: jasmine.SpyObj<ConsentConfigurationService>;
  let dialogs: jasmine.SpyObj<ConfirmationDialogsService>;

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  function loadRows(): void {
    component.parse(
      sheetData([
        LEGACY_COLUMNS,
        GOOD,
        ['9', '2025-06-14', 'P-REG', 'hi', '', '', '', ''],
      ]),
      'old.xlsx',
    );
  }

  beforeEach(() => {
    service = jasmine.createSpyObj('ConsentConfigurationService', [
      'validateLegacyConsents',
      'importLegacyConsents',
    ]);
    dialogs = jasmine.createSpyObj('ConfirmationDialogsService', [
      'alert',
      'confirm',
    ]);
    TestBed.configureTestingModule({
      declarations: [LegacyConsentUploadComponent],
      imports: [MaterialModule, FormsModule, NoopAnimationsModule],
      providers: [
        { provide: ConsentConfigurationService, useValue: service },
        { provide: ConfirmationDialogsService, useValue: dialogs },
      ],
    });
    fixture = TestBed.createComponent(LegacyConsentUploadComponent);
    component = fixture.componentInstance;
    component.serviceProviderId = 1;
    component.userName = 'padmin1';
    fixture.detectChanges();
  });

  it('downloads a template with every column and an example row', () => {
    const save = spyOn(component, 'saveWorkbook');
    component.downloadTemplate();
    const [sheet, name] = save.calls.mostRecent().args;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    expect(name).toBe('legacy-consent-template.xlsx');
    expect(rows[0]).toEqual(LEGACY_COLUMNS);
    expect(rows[1][0]).toBe('123456789012');
  });

  it('downloads a workbook through a temporary link', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:x');
    spyOn(URL, 'revokeObjectURL');
    const click = spyOn(HTMLAnchorElement.prototype, 'click');
    component.saveWorkbook(XLSX.utils.aoa_to_sheet([['a']]), 'x.xlsx');
    const link = click.calls.mostRecent().object as HTMLAnchorElement;
    expect(link.download).toBe('x.xlsx');
    expect(link.href).toBe('blob:x');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x');
  });

  it('reads rows with sheet row numbers and trimmed text', () => {
    component.parse(
      sheetData([
        LEGACY_COLUMNS,
        [' 101 ', '2025-06-14', 'P-REG', 'hi', 'PAPER'],
      ]),
      'old.xlsx',
    );
    fixture.detectChanges();
    expect(component.fileError).toBeNull();
    expect(component.rows).toEqual([
      {
        rowNo: 2,
        beneficiaryId: '101',
        consentDate: '2025-06-14',
        purposesGranted: 'P-REG',
        languageCode: 'hi',
        mode: 'PAPER',
        representativeName: '',
        representativeRelationship: '',
        remarks: '',
      },
    ]);
    expect(el().textContent).toContain('old.xlsx · 1 rows');
    expect(component.canCheck).toBeTrue();
  });

  it('rejects empty files, missing columns, too many rows and unreadable data', () => {
    component.parse(sheetData([LEGACY_COLUMNS]), 'a.xlsx');
    expect(component.fileError).toBe('The file has no rows');
    component.parse(
      sheetData([
        ['beneficiaryId', 'consentDate'],
        ['1', '2025-01-01'],
      ]),
      'a.xlsx',
    );
    expect(component.fileError).toContain(
      'purposesGranted, languageCode, mode',
    );
    const many = [LEGACY_COLUMNS as unknown[]].concat(
      Array.from({ length: 5001 }, () => GOOD),
    );
    component.parse(sheetData(many), 'a.xlsx');
    expect(component.fileError).toContain('limit is 5000');
    component.parse(null as unknown as ArrayBuffer, 'a.xlsx');
    expect(component.fileError).toBe('The file could not be read');
    expect(component.rows).toEqual([]);
    expect(component.canCheck).toBeFalse();
  });

  describe('choosing a file', () => {
    function input(file: File | null): HTMLInputElement {
      return {
        files: file ? [file] : [],
        value: 'x',
      } as unknown as HTMLInputElement;
    }

    it('ignores no file and rejects other types or big files', () => {
      component.onFileChange(input(null));
      expect(component.fileError).toBeNull();
      component.onFileChange(input(new File(['x'], 'a.pdf')));
      expect(component.fileError).toContain('Excel');
      const big = new File(['x'], 'a.csv');
      Object.defineProperty(big, 'size', { value: 6 * 1000 * 1000 });
      component.onFileChange(input(big));
      expect(component.fileError).toContain('5 MB');
    });

    it('reads a chosen file', (done) => {
      const parse = spyOn(component, 'parse').and.callFake((_d, name) => {
        expect(name).toBe('Old.XLSX');
        done();
      });
      const box = input(
        new File([sheetData([LEGACY_COLUMNS, GOOD])], 'Old.XLSX'),
      );
      component.onFileChange(box);
      expect(box.value).toBe('');
      expect(parse).not.toHaveBeenCalled();
    });

    it('reports a file that cannot be read', () => {
      const reader = jasmine.createSpyObj('FileReader', ['readAsArrayBuffer']);
      spyOn(window as any, 'FileReader').and.returnValue(reader);
      component.onFileChange(input(new File(['x'], 'a.csv')));
      reader.onerror();
      expect(component.fileError).toBe('The file could not be read');
    });
  });

  it('checks the rows and shows each result with readable reasons', () => {
    loadRows();
    service.validateLegacyConsents.and.returnValue(
      of({ statusCode: 200, data: checked() }),
    );
    component.check();
    fixture.detectChanges();
    expect(service.validateLegacyConsents).toHaveBeenCalledWith({
      serviceProviderId: 1,
      fileName: 'old.xlsx',
      uploadedBy: 'padmin1',
      rows: component.rows,
    });
    expect(component.busy).toBeFalse();
    expect(el().querySelectorAll('tbody tr').length).toBe(2);
    expect(el().textContent).toContain(
      'Beneficiary ID not found; Missing mode',
    );
    component.errorsOnly = true;
    fixture.detectChanges();
    expect(el().querySelectorAll('tbody tr').length).toBe(1);
    expect(component.canCheck).toBeFalse();
    component.check();
    expect(service.validateLegacyConsents).toHaveBeenCalledTimes(1);
  });

  it('alerts when the check fails', () => {
    loadRows();
    service.validateLegacyConsents.and.returnValue(
      of({ statusCode: 5000, errorMessage: 'Too many rows (max 5000)' }),
    );
    component.check();
    expect(dialogs.alert).toHaveBeenCalledWith(
      'Too many rows (max 5000)',
      'error',
    );
    expect(component.batch).toBeNull();
    service.validateLegacyConsents.and.returnValue(of(null));
    component.check();
    expect(dialogs.alert).toHaveBeenCalledWith(
      'Could not check the file',
      'error',
    );
    service.validateLegacyConsents.and.returnValue(
      throwError(() => ({ error: { errorMessage: 'Down' } })),
    );
    component.check();
    expect(dialogs.alert).toHaveBeenCalledWith('Down', 'error');
    expect(component.busy).toBeFalse();
  });

  it('imports the valid rows after confirming and reports the counts', () => {
    loadRows();
    component.batch = checked();
    dialogs.confirm.and.returnValue(of(true));
    const after = checked();
    after.rows[0].status = 'IMPORTED';
    after.imported = 1;
    service.importLegacyConsents.and.returnValue(
      of({ statusCode: 200, data: after }),
    );
    component.importValid();
    expect(dialogs.confirm.calls.mostRecent().args[1]).toBe(
      'Import 1 consent records? 1 rows with errors will be left out.',
    );
    expect(service.importLegacyConsents).toHaveBeenCalledWith(
      'lb-1',
      'padmin1',
    );
    expect(dialogs.alert).toHaveBeenCalledWith(
      'Imported 1, skipped 0, errors 1',
      'success',
    );
    expect(component.imported).toBeTrue();
    expect(component.canImport).toBeFalse();
    fixture.detectChanges();
    expect(el().textContent).toContain('1 imported');
    component.importValid();
    expect(service.importLegacyConsents).toHaveBeenCalledTimes(1);
  });

  it('does not import when cancelled, or when the import fails', () => {
    component.batch = { ...checked(), failed: 0 };
    dialogs.confirm.and.returnValue(of(false));
    component.importValid();
    expect(dialogs.confirm.calls.mostRecent().args[1]).toBe(
      'Import 1 consent records?',
    );
    expect(service.importLegacyConsents).not.toHaveBeenCalled();
    dialogs.confirm.and.returnValue(of(true));
    service.importLegacyConsents.and.returnValue(
      of({ statusCode: 5000, errorMessage: 'Batch already imported' }),
    );
    component.importValid();
    expect(dialogs.alert).toHaveBeenCalledWith(
      'Batch already imported',
      'error',
    );
    service.importLegacyConsents.and.returnValue(
      throwError(() => ({ errorMessage: 'Offline' })),
    );
    component.importValid();
    expect(dialogs.alert).toHaveBeenCalledWith('Offline', 'error');
    service.importLegacyConsents.and.returnValue(throwError(() => ({})));
    component.importValid();
    expect(dialogs.alert).toHaveBeenCalledWith('Could not import', 'error');
  });

  it('downloads the result with every row', () => {
    const save = spyOn(component, 'saveWorkbook');
    component.downloadResult();
    expect(save).not.toHaveBeenCalled();
    component.batch = checked();
    component.downloadResult();
    const [sheet, name] = save.calls.mostRecent().args;
    expect(name).toBe('legacy-consent-result-lb-1.xlsx');
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
    expect(rows.length).toBe(3);
    expect(rows[2]).toEqual([
      3,
      '9',
      'ERROR',
      'Beneficiary ID not found; Missing mode',
    ]);
  });

  it('starts again and closes', () => {
    loadRows();
    component.batch = checked();
    component.reset();
    expect(component.rows).toEqual([]);
    expect(component.batch).toBeNull();
    const closed = jasmine.createSpy('closed');
    component.closed.subscribe(closed);
    (
      el().querySelector('button[aria-label="Close"]') as HTMLButtonElement
    ).click();
    expect(closed).toHaveBeenCalled();
  });

  it('shows an empty filter result', () => {
    component.batch = {
      ...checked(),
      rows: [{ rowNo: 2, beneficiaryId: '1', status: 'VALID', reasons: [] }],
    };
    component.errorsOnly = true;
    fixture.detectChanges();
    expect(el().textContent).toContain('No rows to show.');
  });

  it('accepts a file with only the required columns and shows no rows before a check', () => {
    expect(component.visibleRows).toEqual([]);
    component.parse(
      sheetData([LEGACY_COLUMNS.slice(0, 5), GOOD.slice(0, 5)]),
      'short.csv',
    );
    expect(component.rows[0].remarks).toBe('');
    expect(component.rows[0].mode).toBe('PAPER');
  });

  it('gives readable reasons and keeps unknown codes', () => {
    expect(reasonText('NEWER_CONSENT_EXISTS')).toBe(
      'Patient already has a newer consent',
    );
    expect(reasonText('MISSING:consentDate')).toBe('Missing consentDate');
    expect(reasonText('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });
});
