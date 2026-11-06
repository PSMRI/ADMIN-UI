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
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigurationService,
  ConsentContext,
  ConsentGrievance,
  ConsentNoticeContent,
  ConsentNoticeEntry,
} from '../services/consent-configuration.service';

export const MESSAGE_MAX_LENGTH = 5000;
/** Admins write the message in English only; no translations are made here. */
export const SOURCE_LANGUAGE = 'en';
export const DECLARATION_MAX_LENGTH = 1000;

type SectionKey = 'dataItems' | 'retention' | 'recipients' | 'withdrawalInfo';
type TextKey =
  | 'body'
  | SectionKey
  | 'grievanceInfo'
  | 'declaration'
  | 'representativeDeclaration';

const TEXT_KEYS: TextKey[] = [
  'body',
  'dataItems',
  'retention',
  'recipients',
  'withdrawalInfo',
  'grievanceInfo',
  'declaration',
  'representativeDeclaration',
];

/** Optional notice sections shown under the message in the field app. */
export const NOTICE_SECTIONS: {
  key: SectionKey;
  label: string;
  hint: string;
}[] = [
  {
    key: 'dataItems',
    label: 'Data collected',
    hint: 'e.g. Name, age, phone, address',
  },
  {
    key: 'retention',
    label: 'How long it is kept',
    hint: 'e.g. 5 years after the last visit',
  },
  {
    key: 'recipients',
    label: 'Who it is shared with',
    hint: 'e.g. Treating facility only',
  },
  {
    key: 'withdrawalInfo',
    label: 'How to withdraw',
    hint: 'e.g. Ask staff at any visit',
  },
];

/** Grievance contact fields (DPDP), in the order shown. */
export const GRIEVANCE_FIELDS: {
  key: keyof ConsentGrievance;
  label: string;
  hint: string;
  max: number;
}[] = [
  {
    key: 'officerName',
    label: 'Grievance officer',
    hint: 'e.g. Grievance Officer, PSMRI',
    max: 100,
  },
  { key: 'phone', label: 'Phone', hint: 'e.g. 1800-000-0000', max: 15 },
  {
    key: 'email',
    label: 'Email',
    hint: 'e.g. grievance@example.org',
    max: 100,
  },
  { key: 'address', label: 'Address', hint: 'Office address', max: 300 },
  {
    key: 'officeHours',
    label: 'Office hours',
    hint: 'e.g. Mon–Sat 10:00–17:00',
    max: 100,
  },
];

const PHONE = /^[0-9+\- ]{8,15}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyGrievance(): ConsentGrievance {
  return {
    officerName: '',
    phone: '',
    email: '',
    address: '',
    officeHours: '',
  };
}

export function emptyContent(): ConsentNoticeContent {
  return {
    body: '',
    dataItems: '',
    retention: '',
    recipients: '',
    withdrawalInfo: '',
    grievanceInfo: '',
    declaration: '',
    representativeDeclaration: '',
    grievance: emptyGrievance(),
  };
}

function contentOf(source: ConsentNoticeContent | null): ConsentNoticeContent {
  const content = emptyContent();
  if (source) {
    TEXT_KEYS.forEach((key) => (content[key] = source[key] || ''));
    const grievance = source.grievance || emptyGrievance();
    GRIEVANCE_FIELDS.forEach(
      (f) => (content.grievance[f.key] = grievance[f.key] || ''),
    );
  }
  return content;
}

/** One line for older field apps that only show `grievanceInfo`. */
export function grievanceLine(g: ConsentGrievance): string {
  return GRIEVANCE_FIELDS.map((f) => g[f.key].trim())
    .filter((v) => v.length > 0)
    .join(', ');
}

/**
 * The consent message field staff show the patient, per project, context and language
 * (feature 003). Saved as a draft, then published; a project without one uses the central message.
 */
@Component({
  selector: 'app-consent-message',
  templateUrl: './consent-message.component.html',
  styleUrls: ['./consent-message.component.css'],
})
export class ConsentMessageComponent implements OnChanges {
  @Input() projectId!: number;
  @Input() serviceProviderId!: number;
  @Input() userName = '';

  readonly sections = NOTICE_SECTIONS;
  readonly grievanceFields = GRIEVANCE_FIELDS;
  readonly maxLength = MESSAGE_MAX_LENGTH;
  readonly declarationMaxLength = DECLARATION_MAX_LENGTH;
  readonly sourceLanguage = SOURCE_LANGUAGE;
  readonly contexts: { value: ConsentContext; label: string }[] = [
    { value: 'REGISTRATION', label: 'Registration' },
    { value: 'REVISIT', label: 'Revisit' },
  ];

  entries: ConsentNoticeEntry[] = [];
  context: ConsentContext = 'REGISTRATION';
  readonly languageCode = SOURCE_LANGUAGE;
  content: ConsentNoticeContent = emptyContent();
  requireReconsent = false;
  showPreview = false;
  loading = false;
  loadFailed = false;
  dirty = false;
  busy = false;

  constructor(
    private consentConfigService: ConsentConfigurationService,
    private confirmationService: ConfirmationDialogsService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projectId'] && this.projectId) {
      this.load();
    }
  }

  load() {
    this.loading = true;
    this.loadFailed = false;
    this.consentConfigService
      .fetchNotices(this.projectId, this.serviceProviderId)
      .subscribe(
        (res: any) => {
          this.loading = false;
          if (res && res.statusCode === 200) {
            this.entries = res.data || [];
            this.fill();
          } else {
            this.loadFailed = true;
          }
        },
        () => {
          this.loading = false;
          this.loadFailed = true;
        },
      );
  }

  entryFor(
    context: ConsentContext,
    languageCode: string | null,
  ): ConsentNoticeEntry | null {
    return (
      this.entries.find(
        (e) => e.context === context && e.languageCode === languageCode,
      ) || null
    );
  }

  get current(): ConsentNoticeEntry | null {
    return this.entryFor(this.context, this.languageCode);
  }

  /** Short state of the message, shown above the form. */
  statusOf(entry: ConsentNoticeEntry | null): string {
    if (!entry || (!entry.draft && !entry.published)) {
      return 'Not set';
    }
    if (entry.draft && entry.published) {
      return `Published v${entry.published.version}, unpublished changes`;
    }
    return entry.published ? `Published v${entry.published.version}` : 'Draft';
  }

  /** What the field app shows today when this language has no published message. */
  get fallbackNote(): string {
    if (this.current?.published) {
      return '';
    }
    const registration = this.entryFor('REGISTRATION', this.languageCode);
    if (this.context === 'REVISIT' && registration?.published) {
      return 'Until this is published, field staff see the Registration message.';
    }
    return 'Until this is published, field staff see the central consent message.';
  }

  selectContext(context: ConsentContext) {
    if (context !== this.context) {
      this.leave(() => {
        this.context = context;
        this.fill();
      });
    }
  }

  markDirty() {
    this.dirty = true;
  }

  get bodyMissing(): boolean {
    return this.content.body.trim().length === 0;
  }

  get declarationMissing(): boolean {
    return this.content.declaration.trim().length === 0;
  }

  /** Grievance contact is optional, but once started it needs a valid phone or email. */
  get grievanceError(): string | null {
    const g = this.content.grievance;
    const phone = g.phone.trim();
    const email = g.email.trim();
    if (phone && !PHONE.test(phone)) {
      return 'Enter a valid phone number';
    }
    if (email && !EMAIL.test(email)) {
      return 'Enter a valid email address';
    }
    if (grievanceLine(g) && !phone && !email) {
      return 'Add a phone number or email for the grievance contact';
    }
    return null;
  }

  get canSave(): boolean {
    return (
      this.dirty && !this.bodyMissing && !this.grievanceError && !this.busy
    );
  }

  /** Only a saved draft is published, so what is published is what was reviewed. */
  get canPublish(): boolean {
    return (
      !this.dirty &&
      !!this.current?.draft &&
      !this.declarationMissing &&
      !this.busy
    );
  }

  /** Why Publish is off, shown next to the buttons and as its tooltip. */
  get publishHint(): string {
    if (this.busy) {
      return '';
    }
    if (this.dirty) {
      return 'Save the draft before publishing';
    }
    if (!this.current?.draft) {
      return this.current?.published
        ? 'Change the message and save a draft to publish a new version'
        : 'Save a draft before publishing';
    }
    return this.declarationMissing
      ? 'Enter the patient declaration and save the draft'
      : '';
  }

  saveDraft() {
    if (!this.canSave) {
      return;
    }
    this.busy = true;
    this.consentConfigService
      .saveNoticeDraft({
        ...this.content,
        grievanceInfo:
          grievanceLine(this.content.grievance) || this.content.grievanceInfo,
        projectId: this.projectId,
        serviceProviderId: this.serviceProviderId,
        context: this.context,
        languageCode: this.languageCode,
        savedBy: this.userName,
      })
      .subscribe(
        (res: any) => {
          this.busy = false;
          if (res && res.statusCode === 200 && res.data) {
            this.replace(this.toEntry(res.data, 'draft'));
            this.dirty = false;
            this.confirmationService.alert('Draft saved', 'success');
          } else {
            this.confirmationService.alert(
              res?.errorMessage || 'Could not save the draft',
              'error',
            );
          }
        },
        (err: any) => {
          this.busy = false;
          this.confirmationService.alert(
            err?.error?.errorMessage ||
              err?.errorMessage ||
              'Could not save the draft',
            'error',
          );
        },
      );
  }

  publish() {
    if (!this.canPublish) {
      return;
    }
    const message = this.requireReconsent
      ? 'Publish this message? Field staff will show it from the next consent, and patients who already consented will be asked again on their next visit.'
      : 'Publish this message? Field staff will show it from the next consent.';
    this.confirmationService
      .confirm('Confirm', message, 'Publish', 'Cancel')
      .subscribe((ok) => {
        if (ok) {
          this.sendPublish();
        }
      });
  }

  /** Puts back the last saved text. */
  discard() {
    this.fill();
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  /** Paragraphs of the message as the field app shows them. */
  get previewParagraphs(): string[] {
    return this.content.body
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  get previewSections(): { label: string; text: string }[] {
    return this.sections
      .map((s) => ({ label: s.label, text: this.content[s.key].trim() }))
      .concat({
        label: 'Grievance contact',
        text: grievanceLine(this.content.grievance),
      })
      .filter((s) => s.text.length > 0);
  }

  private sendPublish() {
    this.busy = true;
    this.consentConfigService
      .publishNotice({
        projectId: this.projectId,
        serviceProviderId: this.serviceProviderId,
        context: this.context,
        languageCode: this.languageCode,
        requireReconsent: this.requireReconsent,
        publishedBy: this.userName,
        // No translation from Admin: English only.
        translateTo: [],
      })
      .subscribe(
        (res: any) => {
          this.busy = false;
          if (res && res.statusCode === 200 && res.data) {
            const entry = this.toEntry(res.data, 'published');
            this.replace(entry);
            this.fill();
            this.confirmationService.alert(
              `Published, version ${entry.published?.version}`,
              'success',
            );
          } else {
            this.confirmationService.alert(
              res?.errorMessage || 'Could not publish',
              'error',
            );
          }
        },
        (err: any) => {
          this.busy = false;
          this.confirmationService.alert(
            err?.error?.errorMessage ||
              err?.errorMessage ||
              'Could not publish',
            'error',
          );
        },
      );
  }

  /** Runs the change, asking first when typed text would be lost. */
  private leave(change: () => void) {
    const ask: Observable<boolean> = this.dirty
      ? this.confirmationService.confirm(
          'Confirm',
          'Discard your unsaved message changes?',
        )
      : of(true);
    ask.subscribe((go) => {
      if (go) {
        change();
      }
    });
  }

  /** Shows the draft when there is one, otherwise the published text. */
  private fill() {
    const entry = this.current;
    this.content = contentOf(entry ? entry.draft || entry.published : null);
    this.requireReconsent = false;
    this.dirty = false;
  }

  /**
   * The entry a save or publish returned, for this context and language. Accepts a full entry
   * ({ draft, published }) with or without context/languageCode, or just the saved draft or
   * published message, keeping the other half from what is already loaded.
   */
  private toEntry(data: any, saved: 'draft' | 'published'): ConsentNoticeEntry {
    const existing = this.current;
    const isEntry = data && ('draft' in data || 'published' in data);
    const base: ConsentNoticeEntry = {
      projectId: this.projectId,
      context: this.context,
      languageCode: this.languageCode,
      draft: existing?.draft ?? null,
      published: existing?.published ?? null,
    };
    if (isEntry) {
      return {
        ...base,
        ...data,
        projectId: data.projectId ?? this.projectId,
        context: data.context || this.context,
        languageCode: data.languageCode || this.languageCode,
      };
    }
    return saved === 'draft'
      ? { ...base, draft: data }
      : { ...base, draft: null, published: data };
  }

  private replace(entry: ConsentNoticeEntry) {
    this.entries = this.entries
      .filter(
        (e) =>
          !(
            e.context === entry.context && e.languageCode === entry.languageCode
          ),
      )
      .concat(entry);
  }
}
