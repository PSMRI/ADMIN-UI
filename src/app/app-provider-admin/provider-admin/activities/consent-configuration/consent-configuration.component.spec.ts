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
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { of, Subject, throwError } from 'rxjs';
import { MaterialModule } from 'src/app/core/material.module';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigMasters,
  ConsentConfigurationService,
  ProjectConsentConfig,
} from '../services/consent-configuration.service';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConsentMessageComponent } from '../consent-message/consent-message.component';
import { LegacyConsentUploadComponent } from '../legacy-consent-upload/legacy-consent-upload.component';
import { ConsentConfigurationComponent } from './consent-configuration.component';

function masters(): ConsentConfigMasters {
  return {
    modes: [
      { mode: 'SELF_READ', name: 'Patient read it' },
      { mode: 'READ_ALOUD', name: 'Read aloud to patient' },
      { mode: 'VOICE_CLIP', name: 'Voice recording' },
      { mode: 'WITNESSED', name: 'Witnessed' },
      { mode: 'SIGNATURE_PHOTO', name: 'Signature / thumb + photo' },
      { mode: 'OTP', name: "OTP to patient's phone" },
    ],
    purposes: [
      { purposeCode: 'P-REG', name: 'Registration', isMandatory: true },
    ],
    languages: [
      { languageCode: 'en', languageName: 'English', hasNotice: true },
    ],
    projects: [{ projectId: 12, version: 4 }],
  };
}

function configured(): ProjectConsentConfig {
  return {
    projectId: 12,
    projectName: 'Test Project A',
    serviceProviderId: 1,
    version: 4,
    savedBy: 'padmin1',
    savedAt: '2026-10-20T11:02:00+05:30',
    registration: {
      enabled: true,
      mandatory: true,
      modes: [
        {
          mode: 'WITNESSED',
          rank: 2,
          settings: { witnessRelationshipRequired: false },
        },
        { mode: 'OTP', rank: 1, settings: {} },
        { mode: 'FACE_SCAN' as never, rank: 3, settings: {} },
      ],
      defaultMode: 'OTP',
      purposes: [
        { purposeCode: 'P-REG', shown: true, rank: 1, isMandatory: true },
      ],
      languages: ['en'],
      guardian: { enabled: true, ageThreshold: 18 },
    },
    revisit: null,
  };
}

function unconfigured(): ProjectConsentConfig {
  return {
    ...configured(),
    projectId: 13,
    projectName: 'Test Project B',
    version: 0,
    savedBy: null,
    savedAt: null,
    // The server's starting values for a project never saved.
    registration: {
      enabled: true,
      mandatory: true,
      modes: [
        'SELF_READ',
        'READ_ALOUD',
        'WITNESSED',
        'SIGNATURE_PHOTO',
        'OTP',
      ].map((mode, i) => ({ mode: mode as never, rank: i + 1, settings: {} })),
      defaultMode: null,
      purposes: [],
      languages: [],
      guardian: { enabled: true, ageThreshold: 18 },
    },
  };
}

const projectA = {
  projectId: 12,
  projectName: 'Test Project A',
  deleted: false,
};
const projectB = {
  projectId: 13,
  projectName: 'Test Project B',
  deleted: false,
};

describe('ConsentConfigurationComponent', () => {
  let fixture: ComponentFixture<ConsentConfigurationComponent>;
  let component: ConsentConfigurationComponent;
  let configService: jasmine.SpyObj<ConsentConfigurationService>;
  let projectService: jasmine.SpyObj<ProjectMasterService>;
  let dialogs: jasmine.SpyObj<ConfirmationDialogsService>;
  let session: jasmine.SpyObj<SessionStorageService>;

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function create() {
    fixture = TestBed.createComponent(ConsentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function open(config: ProjectConsentConfig, project = projectA) {
    configService.fetchConfig.and.returnValue(
      of({ statusCode: 200, data: config }),
    );
    component.showTable = false;
    component.onProjectSelected(project);
    fixture.detectChanges();
  }

  beforeEach(() => {
    configService = jasmine.createSpyObj('ConsentConfigurationService', [
      'getMasters',
      'fetchAllConfigs',
      'fetchConfig',
      'saveConfig',
      'updateConfig',
      'fetchNotices',
    ]);
    configService.fetchNotices.and.returnValue(
      of({ statusCode: 200, data: [] }),
    );
    projectService = jasmine.createSpyObj('ProjectMasterService', [
      'getProjectMasters',
    ]);
    dialogs = jasmine.createSpyObj('ConfirmationDialogsService', [
      'alert',
      'confirm',
    ]);
    session = jasmine.createSpyObj('SessionStorageService', ['getItem']);
    session.getItem.and.callFake((key: string) =>
      key === 'service_providerID' ? '1' : key === 'uname' ? 'padmin1' : null,
    );
    configService.getMasters.and.returnValue(
      of({ statusCode: 200, data: masters() }),
    );
    configService.fetchAllConfigs.and.returnValue(
      of({ statusCode: 200, data: [configured()] }),
    );
    projectService.getProjectMasters.and.returnValue(
      of({
        statusCode: 200,
        data: [
          projectA,
          projectB,
          { projectId: 14, projectName: 'Old', deleted: true },
        ],
      }),
    );
    TestBed.configureTestingModule({
      declarations: [
        ConsentConfigurationComponent,
        ConsentMessageComponent,
        LegacyConsentUploadComponent,
      ],
      imports: [MaterialModule, FormsModule, NoopAnimationsModule],
      providers: [
        { provide: ConsentConfigurationService, useValue: configService },
        { provide: ProjectMasterService, useValue: projectService },
        { provide: ConfirmationDialogsService, useValue: dialogs },
        { provide: SessionStorageService, useValue: session },
      ],
    });
  });

  describe('on init', () => {
    it('loads active projects, masters and mappings for the provider', () => {
      create();
      expect(projectService.getProjectMasters).toHaveBeenCalledWith(1);
      expect(configService.getMasters).toHaveBeenCalledWith(1);
      expect(configService.fetchAllConfigs).toHaveBeenCalledWith(1);
      expect(component.showTable).toBeTrue();
      expect(component.projectNames.map((p) => p.projectId)).toEqual([12, 13]);
      expect(component.userName).toBe('padmin1');
      expect(el().textContent).toContain('Consent Configuration');
      expect(el().querySelector('mat-tab-group')).toBeNull();
    });

    it('uses an empty user name when none is stored', () => {
      session.getItem.and.returnValue(null);
      create();
      expect(component.userName).toBe('');
    });

    it('alerts when projects or masters fail with a status', () => {
      projectService.getProjectMasters.and.returnValue(
        of({ statusCode: 500, errorMessage: 'p down' }),
      );
      configService.getMasters.and.returnValue(
        of({ statusCode: 500, errorMessage: 'm down' }),
      );
      configService.fetchAllConfigs.and.returnValue(
        of({ statusCode: 500, errorMessage: 'c down' }),
      );
      create();
      expect(dialogs.alert).toHaveBeenCalledWith('p down', 'error');
      expect(dialogs.alert).toHaveBeenCalledWith('m down', 'error');
      expect(dialogs.alert).toHaveBeenCalledWith('c down', 'error');
    });

    it('alerts when projects or masters calls error', () => {
      projectService.getProjectMasters.and.returnValue(
        throwError(() => ({ errorMessage: 'p err' })),
      );
      configService.getMasters.and.returnValue(
        throwError(() => ({ errorMessage: 'm err' })),
      );
      configService.fetchAllConfigs.and.returnValue(
        throwError(() => ({ errorMessage: 'c err' })),
      );
      create();
      expect(dialogs.alert).toHaveBeenCalledWith('p err', 'error');
      expect(dialogs.alert).toHaveBeenCalledWith('m err', 'error');
      expect(dialogs.alert).toHaveBeenCalledWith('c err', 'error');
    });

    it('handles empty project data and empty responses', () => {
      projectService.getProjectMasters.and.returnValue(
        of({ statusCode: 200, data: null }),
      );
      configService.getMasters.and.returnValue(of(null));
      configService.fetchAllConfigs.and.returnValue(
        of({ statusCode: 200, data: null }),
      );
      create();
      expect(component.projectNames).toEqual([]);
      expect(component.mappings).toEqual([]);
      expect(el().textContent).toContain('No Records Found');
      expect(dialogs.alert).toHaveBeenCalledWith(undefined as never, 'error');
    });
  });

  describe('mapping list', () => {
    beforeEach(() => create());

    it('shows one row per mapped project with its modes, default marked', () => {
      const row = el().querySelector('.consent-config-mappings tbody tr');
      expect(row?.textContent).toContain('Test Project A');
      expect(row?.textContent).toContain('On');
      expect(row?.textContent).toContain('Yes');
      expect(row?.textContent).toContain(
        "OTP to patient's phone (default), Witnessed",
      );
      expect(row?.textContent).toContain('padmin1');
    });

    it('shows a dash for modes and no time when consent is off or unsaved', () => {
      const off = {
        ...configured(),
        savedAt: null,
        registration: { ...configured().registration, enabled: false },
      };
      expect(component.modeNames(off)).toBe('-');
      component.mappings = [off];
      component.dataSource.data = [off];
      fixture.detectChanges();
      const row = el().querySelector('.consent-config-mappings tbody tr');
      expect(row?.textContent).toContain('Off');
      expect(row?.textContent).toContain('No');
    });

    it('shows a dash when a mapping has no modes, and built-in names when masters are missing', () => {
      const none = {
        ...configured(),
        registration: {
          ...configured().registration,
          modes: undefined as never,
        },
      };
      expect(component.modeNames(none)).toBe('-');
      component.masters = null;
      expect(component.modeNames(configured())).toBe(
        "OTP to patient's phone (default), Witnessed",
      );
    });

    it('filters rows by project name or mode', () => {
      component.filterMappings('witness');
      expect(component.dataSource.data.length).toBe(1);
      component.filterMappings('project a');
      expect(component.dataSource.data.length).toBe(1);
      component.filterMappings('nothing');
      expect(component.dataSource.data.length).toBe(0);
      component.filterMappings('');
      expect(component.dataSource.data.length).toBe(1);
    });

    it('opens an empty form with only unmapped projects on Add Mapping', () => {
      (el().querySelector('.consent-config-add') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(component.showTable).toBeFalse();
      expect(component.editMode).toBeFalse();
      expect(component.filteredOptions).toEqual([projectB]);
      expect(el().textContent).toContain('Add Consent Mapping');
      expect(el().querySelector('mat-tab-group')).toBeNull();
      (el().querySelector('.consent-config-back') as HTMLButtonElement).click();
      expect(component.showTable).toBeTrue();
    });

    it('opens the mapped project on Edit', () => {
      configService.fetchConfig.and.returnValue(
        of({ statusCode: 200, data: configured() }),
      );
      (el().querySelector('.consent-config-edit') as HTMLElement).click();
      fixture.detectChanges();
      expect(component.editMode).toBeTrue();
      expect(component.project).toBe(projectA);
      expect(configService.fetchConfig).toHaveBeenCalledWith(12, 1);
      expect(el().textContent).toContain('Edit Consent Mapping');
      expect(
        el().querySelector('.consent-config-project')?.textContent,
      ).toContain('Test Project A');
    });

    it('edits a mapping whose project is not in the active list', () => {
      configService.fetchConfig.and.returnValue(
        of({ statusCode: 200, data: { ...configured(), projectId: 99 } }),
      );
      component.editMapping({ ...configured(), projectId: 99 });
      expect(component.project).toEqual({
        projectId: 99,
        projectName: 'Test Project A',
      });
    });

    it('asks before going back with unsaved changes', () => {
      configService.fetchConfig.and.returnValue(
        of({ statusCode: 200, data: configured() }),
      );
      component.editMapping(configured());
      component.markDirty();
      dialogs.confirm.and.returnValue(of(false));
      component.back();
      expect(component.showTable).toBeFalse();
      dialogs.confirm.and.returnValue(of(true));
      component.back();
      expect(component.showTable).toBeTrue();
      expect(component.loaded).toBeNull();
      expect(configService.fetchAllConfigs).toHaveBeenCalledTimes(2);
    });

    it('asks before going back with an unsaved consent message (feature 003)', () => {
      configService.fetchConfig.and.returnValue(
        of({ statusCode: 200, data: configured() }),
      );
      component.editMapping(configured());
      component.message = { dirty: true } as ConsentMessageComponent;
      dialogs.confirm.and.returnValue(of(false));
      component.back();
      expect(dialogs.confirm).toHaveBeenCalled();
      expect(component.showTable).toBeFalse();
    });
  });

  describe('project picker', () => {
    beforeEach(() => create());

    it('filters unmapped projects by typed text or by a selected project', () => {
      component.filterOptions(' project b');
      expect(component.filteredOptions).toEqual([projectB]);
      component.filterOptions(projectA);
      expect(component.filteredOptions).toEqual([]);
      component.filterOptions(null);
      expect(component.filteredOptions).toEqual([projectB]);
    });

    it('shows the project name', () => {
      expect(component.displayFn(projectA)).toBe('Test Project A');
      expect(component.displayFn(null)).toBe('');
    });

    it('alerts when the configuration cannot be fetched', () => {
      configService.fetchConfig.and.returnValue(
        of({ statusCode: 500, errorMessage: 'nope' }),
      );
      component.onProjectSelected(projectA);
      expect(dialogs.alert).toHaveBeenCalledWith('nope', 'error');
      configService.fetchConfig.and.returnValue(of(null));
      component.onProjectSelected(projectA);
      expect(dialogs.alert).toHaveBeenCalledWith(undefined as never, 'error');
      configService.fetchConfig.and.returnValue(
        throwError(() => ({ errorMessage: 'net' })),
      );
      component.onProjectSelected(projectA);
      expect(dialogs.alert).toHaveBeenCalledWith('net', 'error');
      expect(component.loaded).toBeNull();
    });

    it('asks before discarding unsaved changes and keeps the project on No', () => {
      open(configured());
      component.markDirty();
      component.project = projectB;
      dialogs.confirm.and.returnValue(of(false));
      component.onProjectSelected(projectB);
      expect(dialogs.confirm).toHaveBeenCalled();
      expect(component.project).toBe(projectA);
      expect(component.loaded?.projectId).toBe(12);
    });

    it('loads the new project when the admin discards changes', () => {
      open(configured());
      component.markDirty();
      dialogs.confirm.and.returnValue(of(true));
      configService.fetchConfig.and.returnValue(
        of({ statusCode: 200, data: unconfigured() }),
      );
      component.onProjectSelected(projectB);
      expect(component.loaded?.projectId).toBe(13);
      expect(component.dirty).toBeFalse();
    });
  });

  describe('configured project', () => {
    beforeEach(() => {
      create();
      open(configured());
    });

    it('shows the version line and the modes in master order', () => {
      expect(el().textContent).toContain('Version 4');
      expect(el().textContent).toContain('padmin1');
      // DPDP: the master still lists voice recording; it is not offered.
      expect(component.rows.map((r) => r.mode)).toEqual([
        'SELF_READ',
        'READ_ALOUD',
        'WITNESSED',
        'SIGNATURE_PHOTO',
        'OTP',
      ]);
      expect(component.tickedRows.map((r) => r.mode)).toEqual([
        'WITNESSED',
        'OTP',
      ]);
      expect(el().querySelector('.consent-config-up')).toBeNull();
      expect(component.rows[2].settings).toEqual({
        witnessRelationshipRequired: false,
      });
      expect(component.effectiveDefault).toBe('OTP');
      expect(el().querySelectorAll('.consent-config-preview li').length).toBe(
        2,
      );
      expect(
        el().querySelector('.consent-config-preview')?.textContent,
      ).toContain('(default)');
    });

    it('blocks saving with no mode ticked', () => {
      component.rows.forEach((r) => component.toggleMode(r, false));
      fixture.detectChanges();
      expect(component.errors.modes).toBe('Pick at least one consent mode');
      expect(el().textContent).toContain('Pick at least one consent mode');
      expect(component.canSave).toBeFalse();
      component.save();
      expect(configService.updateConfig).not.toHaveBeenCalled();
    });

    it('blocks saving while the default mode is not ticked', () => {
      component.toggleMode(component.rows[4], false);
      component.toggleMode(component.rows[0], true);
      fixture.detectChanges();
      expect(component.errors.defaultMode).toBe(
        'Choose a ticked mode as default',
      );
      expect(el().textContent).toContain('Choose a ticked mode as default');
      component.setDefault('SELF_READ');
      expect(component.errors).toEqual({});
      expect(component.canSave).toBeTrue();
    });

    it('uses the only ticked mode as the default', () => {
      component.defaultMode = null;
      component.toggleMode(component.rows[2], false);
      expect(component.effectiveDefault).toBe('OTP');
      expect(component.errors).toEqual({});
    });

    it('needs a default when several modes are ticked and none is chosen', () => {
      component.defaultMode = null;
      expect(component.errors.defaultMode).toBeDefined();
    });

    it('does not validate modes while consent is off', () => {
      component.enabled = false;
      component.rows.forEach((r) => (r.ticked = false));
      expect(component.errors).toEqual({});
    });

    it('updates with the base version and returns to the list', () => {
      const saved = { ...configured(), version: 5 };
      configService.updateConfig.and.returnValue(
        of({ statusCode: 200, data: saved }),
      );
      (el().querySelector('.consent-config-save') as HTMLButtonElement).click();
      const body = configService.updateConfig.calls.mostRecent().args[0];
      expect(body.baseVersion).toBe(4);
      expect(body.modifiedBy).toBe('padmin1');
      expect(body.projectName).toBe('Test Project A');
      expect(body.registration.modes).toEqual([
        {
          mode: 'WITNESSED',
          rank: 1,
          settings: { witnessRelationshipRequired: false },
        },
        { mode: 'OTP', rank: 2, settings: {} },
      ]);
      expect(body.registration.defaultMode).toBe('OTP');
      expect(body.registration.purposes).toEqual(
        configured().registration.purposes,
      );
      expect(body.revisit).toBeNull();
      expect(dialogs.alert).toHaveBeenCalledWith('Saved, version 5', 'success');
      expect(component.showTable).toBeTrue();
      expect(component.loaded).toBeNull();
      expect(configService.fetchAllConfigs).toHaveBeenCalledTimes(2);
    });

    it('stores no default when consent is off and nothing is ticked', () => {
      configService.updateConfig.and.returnValue(
        of({ statusCode: 200, data: configured() }),
      );
      component.enabled = false;
      component.rows.forEach((r) => (r.ticked = false));
      component.save();
      const body = configService.updateConfig.calls.mostRecent().args[0];
      expect(body.registration.enabled).toBeFalse();
      expect(body.registration.modes).toEqual([]);
      expect(body.registration.defaultMode).toBeNull();
    });

    it('tells the admin to reload on a stale version', () => {
      configService.updateConfig.and.returnValue(
        throwError(() => ({
          status: 409,
          error: { data: { reason: 'STALE_VERSION' } },
        })),
      );
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith(
        'Changed by someone else, reload',
        'error',
      );
      expect(component.saving).toBeFalse();
    });

    it('recognises a stale reason without a 409 status', () => {
      configService.updateConfig.and.returnValue(
        throwError(() => ({
          status: 0,
          error: { data: { reason: 'STALE_VERSION' } },
        })),
      );
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith(
        'Changed by someone else, reload',
        'error',
      );
    });

    it('shows other save errors', () => {
      configService.updateConfig.and.returnValue(
        throwError(() => ({
          status: 400,
          error: { errorMessage: 'bad field' },
        })),
      );
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith('bad field', 'error');
      configService.updateConfig.and.returnValue(
        throwError(() => ({ errorMessage: 'net' })),
      );
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith('net', 'error');
      configService.updateConfig.and.returnValue(throwError(() => null));
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith('Could not save', 'error');
    });

    it('shows a failed save status', () => {
      configService.updateConfig.and.returnValue(
        of({ statusCode: 500, errorMessage: 'db' }),
      );
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith('db', 'error');
      configService.updateConfig.and.returnValue(of(null));
      component.save();
      expect(dialogs.alert).toHaveBeenCalledWith(undefined as never, 'error');
    });

    it('keeps the stored project name when no project object is selected', () => {
      configService.updateConfig.and.returnValue(
        of({ statusCode: 200, data: configured() }),
      );
      component.selectedProject = null;
      component.save();
      expect(
        configService.updateConfig.calls.mostRecent().args[0].projectName,
      ).toBe('Test Project A');
    });

    it('resets to the loaded configuration and reloads from the server', () => {
      component.toggleMode(component.rows[4], false);
      fixture.detectChanges();
      (
        el().querySelector('.consent-config-reset') as HTMLButtonElement
      ).click();
      expect(component.tickedRows.length).toBe(2);
      expect(component.dirty).toBeFalse();
      component.reload();
      expect(configService.fetchConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('unconfigured project', () => {
    beforeEach(() => {
      create();
      open(unconfigured(), projectB);
    });

    it('shows the server starting values exactly', () => {
      expect(el().textContent).toContain('Not yet configured');
      expect(component.notConfigured).toBeTrue();
      expect(component.tickedRows.length).toBe(5);
      expect(component.defaultMode).toBeNull();
      expect(component.errors.defaultMode).toBeDefined();
    });

    it('saves the first version with createdBy', () => {
      configService.saveConfig.and.returnValue(
        of({
          statusCode: 200,
          data: {
            ...unconfigured(),
            version: 1,
            registration: configured().registration,
          },
        }),
      );
      component.setDefault('SELF_READ');
      component.save();
      const body = configService.saveConfig.calls.mostRecent().args[0];
      expect(body.createdBy).toBe('padmin1');
      expect(body.baseVersion).toBeUndefined();
      expect(body.registration.modes.length).toBe(5);
      expect(body.registration.guardian).toEqual({
        enabled: true,
        ageThreshold: 18,
      });
      expect(dialogs.alert).toHaveBeenCalledWith('Saved, version 1', 'success');
      expect(component.showTable).toBeTrue();
    });
  });

  it('cannot save, reset or reload before a project is loaded', () => {
    create();
    expect(component.canSave).toBeFalse();
    expect(component.notConfigured).toBeFalse();
    component.save();
    component.reset();
    component.reload();
    expect(configService.updateConfig).not.toHaveBeenCalled();
    expect(configService.fetchConfig).not.toHaveBeenCalled();
  });

  it('shows no rows and a message when masters has no modes', () => {
    configService.getMasters.and.returnValue(
      of({ statusCode: 200, data: null }),
    );
    create();
    open({
      ...configured(),
      registration: { ...configured().registration, modes: undefined as never },
    });
    expect(component.rows).toEqual([]);
    expect(el().textContent).toContain('Consent modes could not be loaded');
    expect(el().querySelector('.consent-config-modes')).toBeNull();
  });

  it('fills the rows when masters answers after the project loaded', () => {
    const late = new Subject<any>();
    configService.getMasters.and.returnValue(late);
    create();
    open(unconfigured(), projectB);
    expect(component.rows).toEqual([]);
    late.next({
      statusCode: 200,
      data: {
        modes: [{ mode: 'SELF_READ', name: 'Self read (master)' }],
        purposes: [],
        languages: [],
        projects: [],
      },
    });
    expect(component.rows.map((r) => r.name)).toEqual(['Self read (master)']);
    expect(component.tickedRows.length).toBe(1);
  });

  describe('DPDP changes', () => {
    it('never offers the retired voice recording mode', () => {
      create();
      open(configured());
      expect(component.rows.map((r) => r.mode)).not.toContain('VOICE_CLIP');
    });

    it('drops a saved default that is a retired mode', () => {
      create();
      open({
        ...configured(),
        registration: {
          ...configured().registration,
          defaultMode: 'VOICE_CLIP',
        },
      });
      expect(component.defaultMode).toBeNull();
      open({
        ...configured(),
        registration: { ...configured().registration, defaultMode: null },
      });
      expect(component.defaultMode).toBeNull();
    });

    it('opens and closes the legacy consent upload from the list', () => {
      create();
      const button = fixture.nativeElement.querySelector(
        '.consent-config-legacy',
      ) as HTMLButtonElement;
      button.click();
      fixture.detectChanges();
      expect(component.showLegacyUpload).toBeTrue();
      const upload = fixture.nativeElement.querySelector(
        'app-legacy-consent-upload',
      );
      expect(upload).not.toBeNull();
      (
        upload.querySelector('button[aria-label="Close"]') as HTMLButtonElement
      ).click();
      fixture.detectChanges();
      expect(component.showLegacyUpload).toBeFalse();
      expect(
        fixture.nativeElement.querySelector('app-legacy-consent-upload'),
      ).toBeNull();
    });
  });

  it('falls back to the mode code when masters lack a name', () => {
    create();
    component.masters = { ...masters(), modes: [{ mode: 'OTP', name: '' }] };
    component.apply(configured());
    expect(component.rows.map((r) => r.name)).toEqual(['OTP']);
  });
});
