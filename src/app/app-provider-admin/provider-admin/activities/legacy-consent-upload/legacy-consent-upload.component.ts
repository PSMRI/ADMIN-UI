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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as XLSX from 'xlsx';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigurationService,
  LegacyBatch,
  LegacyConsentRow,
  LegacyRowResult,
} from '../services/consent-configuration.service';

export const LEGACY_MAX_ROWS = 5000;
export const LEGACY_MAX_MB = 5;
const VALID_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

type LegacyColumn = Exclude<keyof LegacyConsentRow, 'rowNo'>;

/** Template columns in order; the first five are required. */
export const LEGACY_COLUMNS: LegacyColumn[] = [
  'beneficiaryId',
  'consentDate',
  'purposesGranted',
  'languageCode',
  'mode',
  'representativeName',
  'representativeRelationship',
  'remarks',
];
const REQUIRED_COLUMNS = LEGACY_COLUMNS.slice(0, 5);

const EXAMPLE_ROW = [
  '123456789012',
  '2025-06-14',
  'P-REG;P-TRT',
  'hi',
  'PAPER',
  '',
  '',
  'Paper form, Raichur camp',
];

/** Readable text for the server's row reasons (contracts/consent-api-changes.md §4–5). */
const REASONS: { [code: string]: string } = {
  UNKNOWN_BENEFICIARY: 'Beneficiary ID not found',
  BAD_DATE: 'Date must be YYYY-MM-DD',
  FUTURE_DATE: 'Date is in the future',
  UNKNOWN_PURPOSE: 'Unknown purpose code',
  UNKNOWN_LANGUAGE: 'Unknown language code',
  UNKNOWN_MODE: 'Unknown consent mode',
  REPRESENTATIVE_REQUIRED: 'Representative name is needed for this mode',
  DUPLICATE_ROW: 'Same patient and date earlier in the file',
  ALREADY_IMPORTED: 'Already imported',
  NEWER_CONSENT_EXISTS: 'Patient already has a newer consent',
};

export function reasonText(code: string): string {
  if (code.indexOf('MISSING:') === 0) {
    return `Missing ${code.substring(8)}`;
  }
  return REASONS[code] || code;
}

/**
 * Bulk upload of consents taken before AMRIT recorded them (DPDP, spec 003 user story 6).
 * The file is read here; the server checks every row, then imports the valid ones.
 */
@Component({
  selector: 'app-legacy-consent-upload',
  templateUrl: './legacy-consent-upload.component.html',
  styleUrls: ['./legacy-consent-upload.component.css'],
})
export class LegacyConsentUploadComponent {
  @Input() serviceProviderId!: number;
  @Input() userName = '';
  @Output() closed = new EventEmitter<void>();

  readonly columns = LEGACY_COLUMNS;
  readonly maxRows = LEGACY_MAX_ROWS;
  readonly maxMb = LEGACY_MAX_MB;
  readonly reasonText = reasonText;

  fileName = '';
  rows: LegacyConsentRow[] = [];
  fileError: string | null = null;
  batch: LegacyBatch | null = null;
  errorsOnly = false;
  busy = false;

  constructor(
    private consentConfigService: ConsentConfigurationService,
    private confirmationService: ConfirmationDialogsService,
  ) {}

  get imported(): boolean {
    return (
      !!this.batch &&
      this.batch.rows.some(
        (r) => r.status === 'IMPORTED' || r.status === 'SKIPPED',
      )
    );
  }

  get canCheck(): boolean {
    return this.rows.length > 0 && !this.batch && !this.busy;
  }

  get canImport(): boolean {
    return !!this.batch && this.batch.valid > 0 && !this.imported && !this.busy;
  }

  get visibleRows(): LegacyRowResult[] {
    const rows = this.batch ? this.batch.rows : [];
    return this.errorsOnly ? rows.filter((r) => r.status === 'ERROR') : rows;
  }

  downloadTemplate() {
    const sheet = XLSX.utils.aoa_to_sheet([this.columns, EXAMPLE_ROW]);
    this.saveWorkbook(sheet, 'legacy-consent-template.xlsx');
  }

  onFileChange(input: HTMLInputElement) {
    const file = input.files && input.files[0];
    input.value = '';
    this.reset();
    if (!file) {
      return;
    }
    const name = file.name.toLowerCase();
    if (!VALID_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      this.fileError = 'Choose an Excel (.xlsx, .xls) or CSV file';
      return;
    }
    if (file.size > LEGACY_MAX_MB * 1000 * 1000) {
      this.fileError = `The file is larger than ${LEGACY_MAX_MB} MB`;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.parse(reader.result as ArrayBuffer, file.name);
    reader.onerror = () => (this.fileError = 'The file could not be read');
    reader.readAsArrayBuffer(file);
  }

  /** Reads the first sheet; row numbers match the sheet (header is row 1). */
  parse(data: ArrayBuffer, fileName: string) {
    this.reset();
    let records: { [column: string]: unknown }[];
    try {
      const book = XLSX.read(data, { type: 'array' });
      const sheet = book.Sheets[book.SheetNames[0]];
      records = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    } catch {
      this.fileError = 'The file could not be read';
      return;
    }
    if (records.length === 0) {
      this.fileError = 'The file has no rows';
      return;
    }
    const missing = REQUIRED_COLUMNS.filter((c) => !(c in records[0]));
    if (missing.length > 0) {
      this.fileError = `Missing columns: ${missing.join(', ')}. Use the template.`;
      return;
    }
    if (records.length > LEGACY_MAX_ROWS) {
      this.fileError = `Too many rows (${records.length}); the limit is ${LEGACY_MAX_ROWS}`;
      return;
    }
    this.fileName = fileName;
    this.rows = records.map((record, i) => {
      const row = { rowNo: i + 2 } as LegacyConsentRow;
      this.columns.forEach((c) => (row[c] = String(record[c] ?? '').trim()));
      return row;
    });
  }

  check() {
    if (!this.canCheck) {
      return;
    }
    this.busy = true;
    this.consentConfigService
      .validateLegacyConsents({
        serviceProviderId: this.serviceProviderId,
        fileName: this.fileName,
        uploadedBy: this.userName,
        rows: this.rows,
      })
      .subscribe(
        (res: any) => this.done(res, 'Could not check the file'),
        (err: any) => this.failed(err, 'Could not check the file'),
      );
  }

  importValid() {
    if (!this.canImport) {
      return;
    }
    const batch = this.batch as LegacyBatch;
    const skipped =
      batch.failed > 0
        ? ` ${batch.failed} rows with errors will be left out.`
        : '';
    this.confirmationService
      .confirm(
        'Confirm',
        `Import ${batch.valid} consent records?${skipped}`,
        'Import',
        'Cancel',
      )
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.busy = true;
        this.consentConfigService
          .importLegacyConsents(batch.batchId, this.userName)
          .subscribe(
            (res: any) => {
              if (this.done(res, 'Could not import')) {
                const b = this.batch as LegacyBatch;
                this.confirmationService.alert(
                  `Imported ${b.imported}, skipped ${b.skipped}, errors ${b.failed}`,
                  'success',
                );
              }
            },
            (err: any) => this.failed(err, 'Could not import'),
          );
      });
  }

  downloadResult() {
    if (!this.batch) {
      return;
    }
    const sheet = XLSX.utils.aoa_to_sheet([
      ['row', 'beneficiaryId', 'status', 'reasons'],
      ...this.batch.rows.map((r) => [
        r.rowNo,
        r.beneficiaryId,
        r.status,
        r.reasons.map(reasonText).join('; '),
      ]),
    ]);
    this.saveWorkbook(
      sheet,
      `legacy-consent-result-${this.batch.batchId}.xlsx`,
    );
  }

  /** Downloads one sheet as an Excel file (same link pattern as the employee bulk upload). */
  saveWorkbook(sheet: XLSX.WorkSheet, fileName: string) {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Consents');
    const data = XLSX.write(book, { type: 'array', bookType: 'xlsx' });
    const url = URL.createObjectURL(
      new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  reset() {
    this.fileName = '';
    this.rows = [];
    this.fileError = null;
    this.batch = null;
    this.errorsOnly = false;
  }

  private done(res: any, fallback: string): boolean {
    this.busy = false;
    if (res && res.statusCode === 200 && res.data) {
      this.batch = res.data;
      return true;
    }
    this.confirmationService.alert(res?.errorMessage || fallback, 'error');
    return false;
  }

  private failed(err: any, fallback: string) {
    this.busy = false;
    this.confirmationService.alert(
      err?.error?.errorMessage || err?.errorMessage || fallback,
      'error',
    );
  }
}
