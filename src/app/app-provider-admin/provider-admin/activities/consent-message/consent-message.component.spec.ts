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
import { MaterialModule } from 'src/app/core/material.module';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigurationService,
  ConsentNoticeEntry,
} from '../services/consent-configuration.service';
import {
  ConsentMessageComponent,
  grievanceLine,
} from './consent-message.component';

const text = {
  body: 'We ask for your consent.\n\nYou can withdraw it at any visit.',
  dataItems: 'Name, phone',
  retention: '',
  recipients: '',
  withdrawalInfo: '',
  grievanceInfo: '',
  declaration: 'I agree to the use of my data.',
  representativeDeclaration: '',
  grievance: {
    officerName: '',
    phone: '',
    email: '',
    address: '',
    officeHours: '',
  },
};

function published(): ConsentNoticeEntry {
  return {
    projectId: 12,
    context: 'REGISTRATION',
    languageCode: 'en',
    draft: null,
    published: {
      ...text,
      noticeVersionId: 101,
      version: 1,
      publishedBy: 'padmin1',
      publishedAt: '2026-10-29T10:00:00+05:30',
    },
  };
}

function drafted(): ConsentNoticeEntry {
  return {
    ...published(),
    draft: {
      ...text,
      body: 'New text',
      savedBy: 'padmin1',
      savedAt: '2026-10-29T11:00:00+05:30',
    },
  };
}

describe('ConsentMessageComponent', () => {
  let fixture: ComponentFixture<ConsentMessageComponent>;
  let component: ConsentMessageComponent;
  let service: jasmine.SpyObj<ConsentConfigurationService>;
  let dialogs: jasmine.SpyObj<ConfirmationDialogsService>;

  function create(entries: ConsentNoticeEntry[] = [published()]) {
    service.fetchNotices.and.returnValue(
      of({ statusCode: 200, data: entries }),
    );
    fixture = TestBed.createComponent(ConsentMessageComponent);
    component = fixture.componentInstance;
    component.serviceProviderId = 1;
    component.userName = 'padmin1';
    component.projectId = 12;
    component.ngOnChanges({ projectId: {} as never });
    fixture.detectChanges();
  }

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  beforeEach(() => {
    service = jasmine.createSpyObj('ConsentConfigurationService', [
      'fetchNotices',
      'saveNoticeDraft',
      'publishNotice',
    ]);
    dialogs = jasmine.createSpyObj('ConfirmationDialogsService', [
      'alert',
      'confirm',
    ]);
    TestBed.configureTestingModule({
      declarations: [ConsentMessageComponent],
      imports: [MaterialModule, FormsModule, NoopAnimationsModule],
      providers: [
        { provide: ConsentConfigurationService, useValue: service },
        { provide: ConfirmationDialogsService, useValue: dialogs },
      ],
    });
  });

  it("loads the project's messages and shows the English published text", () => {
    create();
    expect(service.fetchNotices).toHaveBeenCalledWith(12, 1);
    expect(component.languageCode).toBe('en');
    expect(component.content.body).toBe(text.body);
    expect(component.statusOf(component.current)).toBe('Published v1');
    expect(component.fallbackNote).toBe('');
    expect(el().textContent).toContain('Published v1');
  });

  it('prefers the saved draft over the published text', () => {
    create([drafted()]);
    expect(component.content.body).toBe('New text');
    expect(component.statusOf(component.current)).toBe(
      'Published v1, unpublished changes',
    );
    expect(component.canPublish).toBeTrue();
  });

  it('explains which message field staff see until one is published', () => {
    create([]);
    expect(component.statusOf(component.current)).toBe('Not set');
    expect(component.content.body).toBe('');
    expect(component.fallbackNote).toContain('central consent message');
    create();
    component.selectContext('REVISIT');
    expect(component.fallbackNote).toContain('Registration message');
  });

  it('shows a retry when the messages cannot be loaded', () => {
    service.fetchNotices.and.returnValue(throwError(() => ({ status: 500 })));
    fixture = TestBed.createComponent(ConsentMessageComponent);
    component = fixture.componentInstance;
    component.projectId = 12;
    component.ngOnChanges({ projectId: {} as never });
    fixture.detectChanges();
    expect(component.loadFailed).toBeTrue();
    expect(el().textContent).toContain('Could not load');
  });

  it('saves a draft only when there is new, non-empty text', () => {
    create();
    expect(component.canSave).toBeFalse();
    component.content.body = '   ';
    component.markDirty();
    expect(component.canSave).toBeFalse();
    component.content.body = 'Updated message';
    const saved = {
      ...published(),
      draft: {
        ...text,
        body: 'Updated message',
        savedBy: 'padmin1',
        savedAt: null,
      },
    };
    service.saveNoticeDraft.and.returnValue(
      of({ statusCode: 200, data: saved }),
    );
    component.saveDraft();
    expect(service.saveNoticeDraft).toHaveBeenCalledWith(
      jasmine.objectContaining({
        projectId: 12,
        serviceProviderId: 1,
        context: 'REGISTRATION',
        languageCode: 'en',
        body: 'Updated message',
        dataItems: 'Name, phone',
        savedBy: 'padmin1',
      }),
    );
    expect(component.dirty).toBeFalse();
    expect(component.current?.draft?.body).toBe('Updated message');
    expect(dialogs.alert).toHaveBeenCalledWith('Draft saved', 'success');
  });

  it('keeps the typed text when saving fails', () => {
    create();
    component.content.body = 'Updated message';
    component.markDirty();
    service.saveNoticeDraft.and.returnValue(
      of({ statusCode: 5000, errorMessage: 'No' }),
    );
    component.saveDraft();
    expect(component.dirty).toBeTrue();
    expect(component.content.body).toBe('Updated message');
    expect(dialogs.alert).toHaveBeenCalledWith('No', 'error');
  });

  it('publishes the saved draft after confirming, with the re-consent choice', () => {
    create([drafted()]);
    component.requireReconsent = true;
    dialogs.confirm.and.returnValue(of(true));
    const after = {
      ...published(),
      published: { ...published().published!, body: 'New text', version: 2 },
    };
    service.publishNotice.and.returnValue(of({ statusCode: 200, data: after }));
    component.publish();
    expect(dialogs.confirm.calls.mostRecent().args[1]).toContain('asked again');
    expect(service.publishNotice).toHaveBeenCalledWith({
      projectId: 12,
      serviceProviderId: 1,
      context: 'REGISTRATION',
      languageCode: 'en',
      requireReconsent: true,
      publishedBy: 'padmin1',
      translateTo: [],
    });
    expect(service.fetchNotices).toHaveBeenCalledTimes(1);
    expect(component.statusOf(component.current)).toBe('Published v2');
    expect(component.requireReconsent).toBeFalse();
    expect(dialogs.alert).toHaveBeenCalledWith(
      'Published, version 2',
      'success',
    );
  });

  it('does not publish unsaved text or when the admin cancels', () => {
    create([drafted()]);
    component.markDirty();
    component.publish();
    expect(dialogs.confirm).not.toHaveBeenCalled();
    component.discard();
    dialogs.confirm.and.returnValue(of(false));
    component.publish();
    expect(service.publishNotice).not.toHaveBeenCalled();
  });

  it('asks before switching away from unsaved text', () => {
    create();
    component.content.body = 'Typed';
    component.markDirty();
    dialogs.confirm.and.returnValue(of(false));
    component.selectContext('REVISIT');
    expect(component.context).toBe('REGISTRATION');
    expect(component.content.body).toBe('Typed');
    dialogs.confirm.and.returnValue(of(true));
    component.selectContext('REVISIT');
    expect(component.context).toBe('REVISIT');
    expect(component.dirty).toBeFalse();
  });

  describe('error and edge paths', () => {
    it('treats a non-200 load as failed and an empty list as no messages', () => {
      service.fetchNotices.and.returnValue(of({ statusCode: 5000 }));
      fixture = TestBed.createComponent(ConsentMessageComponent);
      component = fixture.componentInstance;
      component.projectId = 12;
      component.ngOnChanges({ projectId: {} as never });
      expect(component.loadFailed).toBeTrue();
      service.fetchNotices.and.returnValue(of({ statusCode: 200, data: null }));
      component.load();
      expect(component.entries).toEqual([]);
    });

    it('labels a draft that was never published', () => {
      create([{ ...drafted(), published: null }]);
      expect(component.statusOf(component.current)).toBe('Draft');
    });

    it('does not save without changes and reports save errors', () => {
      create();
      component.saveDraft();
      expect(service.saveNoticeDraft).not.toHaveBeenCalled();
      component.content.body = 'Edited';
      component.markDirty();
      service.saveNoticeDraft.and.returnValue(of(null));
      component.saveDraft();
      expect(dialogs.alert).toHaveBeenCalledWith(
        'Could not save the draft',
        'error',
      );
      service.saveNoticeDraft.and.returnValue(
        throwError(() => ({ error: { errorMessage: 'Server says no' } })),
      );
      component.saveDraft();
      expect(dialogs.alert).toHaveBeenCalledWith('Server says no', 'error');
      service.saveNoticeDraft.and.returnValue(
        throwError(() => ({ errorMessage: 'Plain error' })),
      );
      component.saveDraft();
      expect(dialogs.alert).toHaveBeenCalledWith('Plain error', 'error');
      service.saveNoticeDraft.and.returnValue(throwError(() => null));
      component.saveDraft();
      expect(dialogs.alert).toHaveBeenCalledWith(
        'Could not save the draft',
        'error',
      );
      expect(component.busy).toBeFalse();
    });

    it('reports publish errors', () => {
      create([drafted()]);
      dialogs.confirm.and.returnValue(of(true));
      service.publishNotice.and.returnValue(
        of({ statusCode: 5000, errorMessage: 'Enter the patient declaration' }),
      );
      component.publish();
      expect(dialogs.alert).toHaveBeenCalledWith(
        'Enter the patient declaration',
        'error',
      );
      service.publishNotice.and.returnValue(of(null));
      component.publish();
      expect(dialogs.alert).toHaveBeenCalledWith('Could not publish', 'error');
      service.publishNotice.and.returnValue(
        throwError(() => ({ error: { errorMessage: 'Down' } })),
      );
      component.publish();
      expect(dialogs.alert).toHaveBeenCalledWith('Down', 'error');
      service.publishNotice.and.returnValue(
        throwError(() => ({ errorMessage: 'Plain' })),
      );
      component.publish();
      expect(dialogs.alert).toHaveBeenCalledWith('Plain', 'error');
      service.publishNotice.and.returnValue(throwError(() => null));
      component.publish();
      expect(dialogs.alert).toHaveBeenCalledWith('Could not publish', 'error');
      expect(component.busy).toBeFalse();
    });
  });

  describe('English only, no translation', () => {
    it('edits English with no language picker or translation view', () => {
      create();
      expect(component.languageCode).toBe('en');
      expect(el().querySelector('.consent-message-languages')).toBeNull();
      expect(el().querySelector('.consent-message-translation')).toBeNull();
      expect(el().querySelector('textarea')).not.toBeNull();
      expect(el().textContent).toContain('Consent message (English)');
      expect(el().textContent).not.toContain('translated');
    });
  });

  describe('declaration and grievance contact (DPDP)', () => {
    it('shows the saved declaration and grievance fields', () => {
      const own = published();
      own.published!.grievance = {
        officerName: 'Officer',
        phone: '1800-000-0000',
        email: '',
        address: '',
        officeHours: '',
      };
      create([own]);
      expect(component.content.declaration).toBe(text.declaration);
      expect(component.content.grievance.phone).toBe('1800-000-0000');
      expect(
        el().querySelector('textarea[name="consent-message-declaration"]'),
      ).not.toBeNull();
      expect(
        el().querySelectorAll('.consent-message-grievance input').length,
      ).toBe(5);
    });

    it('fills missing fields from an older saved message with empty text', () => {
      const old = published() as any;
      delete old.published.declaration;
      delete old.published.grievance;
      create([old]);
      expect(component.content.declaration).toBe('');
      expect(component.content.grievance).toEqual({
        officerName: '',
        phone: '',
        email: '',
        address: '',
        officeHours: '',
      });
    });

    it('blocks publishing without a declaration and says why', () => {
      const entry = drafted();
      entry.draft!.declaration = ' ';
      create([entry]);
      expect(component.declarationMissing).toBeTrue();
      expect(component.canPublish).toBeFalse();
      expect(component.publishHint).toBe(
        'Enter the patient declaration and save the draft',
      );
      fixture.detectChanges();
      expect(
        el().querySelector('.consent-message-publish-hint')?.textContent,
      ).toContain('Enter the patient declaration');
      component.markDirty();
      expect(component.publishHint).toBe('Save the draft before publishing');
      component.discard();
      component.content.declaration = 'I agree';
      expect(component.publishHint).toBe('');
    });

    it('asks for a draft first when there is none', () => {
      create([]);
      expect(component.publishHint).toBe('Save a draft before publishing');
      create();
      expect(component.publishHint).toBe(
        'Change the message and save a draft to publish a new version',
      );
    });

    it('enables Publish after saving, whatever shape the saved draft comes back in', () => {
      const draft = {
        ...text,
        body: 'Updated message',
        savedBy: 'padmin1',
        savedAt: null,
      };
      // Just the draft, no entry wrapper.
      create([]);
      component.content = { ...text, body: 'Updated message' } as never;
      component.markDirty();
      service.saveNoticeDraft.and.returnValue(
        of({ statusCode: 200, data: draft }),
      );
      component.saveDraft();
      expect(component.current?.draft?.body).toBe('Updated message');
      expect(component.canPublish).toBeTrue();
      // An entry without context or languageCode.
      create([]);
      component.content = { ...text, body: 'Updated message' } as never;
      component.markDirty();
      service.saveNoticeDraft.and.returnValue(
        of({ statusCode: 200, data: { draft, published: null } }),
      );
      component.saveDraft();
      expect(component.current?.context).toBe('REGISTRATION');
      expect(component.current?.languageCode).toBe('en');
      expect(component.canPublish).toBeTrue();
    });

    it('needs a valid phone or email once a grievance field is filled', () => {
      create();
      component.content.body = 'Text';
      component.markDirty();
      const g = component.content.grievance;
      g.officerName = 'Officer';
      expect(component.grievanceError).toContain('phone number or email');
      expect(component.canSave).toBeFalse();
      g.phone = '12ab';
      expect(component.grievanceError).toBe('Enter a valid phone number');
      g.phone = '1800-000-0000';
      expect(component.grievanceError).toBeNull();
      g.email = 'not-an-email';
      expect(component.grievanceError).toBe('Enter a valid email address');
      g.phone = '';
      g.email = 'g@example.org';
      expect(component.grievanceError).toBeNull();
      expect(component.canSave).toBeTrue();
      fixture.detectChanges();
      g.email = 'bad';
      fixture.detectChanges();
      expect(
        el().querySelector('.consent-message-grievance [role="alert"]')!
          .textContent,
      ).toContain('valid email');
    });

    it('saves the declaration, grievance contact and a one-line grievance text', () => {
      create();
      component.content.declaration = 'I agree';
      component.content.grievance = {
        officerName: 'Officer',
        phone: '1800-000-0000',
        email: '',
        address: 'Hyd',
        officeHours: '',
      };
      component.markDirty();
      service.saveNoticeDraft.and.returnValue(
        of({ statusCode: 200, data: published() }),
      );
      component.saveDraft();
      expect(service.saveNoticeDraft).toHaveBeenCalledWith(
        jasmine.objectContaining({
          declaration: 'I agree',
          grievance: jasmine.objectContaining({ phone: '1800-000-0000' }),
          grievanceInfo: 'Officer, 1800-000-0000, Hyd',
        }),
      );
    });

    it('keeps an older grievance text when no contact is entered', () => {
      const old = published();
      old.published!.grievanceInfo = 'Call the DPO';
      create([old]);
      component.content.body = 'Edited';
      component.markDirty();
      service.saveNoticeDraft.and.returnValue(
        of({ statusCode: 200, data: published() }),
      );
      component.saveDraft();
      expect(
        service.saveNoticeDraft.calls.mostRecent().args[0].grievanceInfo,
      ).toBe('Call the DPO');
    });

    it('previews the declaration and grievance contact', () => {
      create();
      component.content.grievance.phone = '1800';
      expect(component.previewSections).toContain({
        label: 'Grievance contact',
        text: '1800',
      });
      component.togglePreview();
      fixture.detectChanges();
      expect(
        el().querySelector('.consent-message-preview-declaration')!.textContent,
      ).toContain(text.declaration);
      expect(
        grievanceLine({
          officerName: ' ',
          phone: '1',
          email: 'e',
          address: '',
          officeHours: 'h',
        }),
      ).toBe('1, e, h');
    });
  });

  it('previews paragraphs and filled-in sections as field staff see them', () => {
    create();
    expect(component.previewParagraphs).toEqual([
      'We ask for your consent.',
      'You can withdraw it at any visit.',
    ]);
    expect(component.previewSections).toEqual([
      { label: 'Data collected', text: 'Name, phone' },
    ]);
    component.togglePreview();
    fixture.detectChanges();
    expect(
      el().querySelector('.consent-message-preview-card')!.textContent,
    ).toContain('You can withdraw it at any visit.');
  });
});
