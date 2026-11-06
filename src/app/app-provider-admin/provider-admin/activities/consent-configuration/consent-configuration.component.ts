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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigMasters,
  ConsentConfigurationService,
  ConsentMode,
  ContextConfig,
  ModeSettings,
  ProjectConsentConfig,
  RETIRED_CONSENT_MODES,
  SaveConsentConfigRequest,
} from '../services/consent-configuration.service';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConsentMessageComponent } from '../consent-message/consent-message.component';

/** Labels used when the masters have not loaded or do not name a mode. */
export const MODE_LABELS: Partial<Record<ConsentMode, string>> = {
  SELF_READ: 'Patient read it',
  READ_ALOUD: 'Read aloud to patient',
  WITNESSED: 'Witnessed',
  SIGNATURE_PHOTO: 'Signed consent form (signature / thumb)',
  OTP: "OTP to patient's phone",
};

/** One row of the modes table, in the master order. */
export interface ModeRow {
  mode: ConsentMode;
  name: string;
  ticked: boolean;
  settings: ModeSettings;
}

@Component({
  selector: 'app-consent-configuration',
  templateUrl: './consent-configuration.component.html',
  styleUrls: ['./consent-configuration.component.css'],
})
export class ConsentConfigurationComponent implements OnInit {
  showTable = true;
  /** DPDP: the legacy consent upload panel is open on the list view. */
  showLegacyUpload = false;
  editMode = false;
  mappings: ProjectConsentConfig[] = [];
  dataSource = new MatTableDataSource<ProjectConsentConfig>();
  displayedColumns = [
    'sno',
    'projectName',
    'consent',
    'mandatory',
    'modes',
    'version',
    'savedBy',
    'edit',
  ];

  @ViewChild(ConsentMessageComponent) message?: ConsentMessageComponent;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  serviceProviderId!: number;
  userName = '';
  projectNames: any[] = [];
  filteredOptions: any[] = [];
  project: any;
  selectedProject: any = null;
  masters: ConsentConfigMasters | null = null;
  loaded: ProjectConsentConfig | null = null;

  enabled = true;
  mandatory = true;
  defaultMode: ConsentMode | null = null;
  rows: ModeRow[] = [];
  dirty = false;
  saving = false;

  constructor(
    private consentConfigService: ConsentConfigurationService,
    private projectMasterService: ProjectMasterService,
    private confirmationService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderId = Number(
      this.sessionstorage.getItem('service_providerID'),
    );
    this.userName = this.sessionstorage.getItem('uname') || '';
    this.getProjects();
    this.getMasters();
    this.getMappings();
  }

  /** Projects that already have a consent configuration, one table row each. */
  getMappings() {
    this.consentConfigService.fetchAllConfigs(this.serviceProviderId).subscribe(
      (res: any) => {
        if (res && res.statusCode === 200) {
          this.mappings = res.data || [];
          this.dataSource.data = this.mappings;
        } else {
          this.confirmationService.alert(res?.errorMessage, 'error');
        }
      },
      (err: any) => this.confirmationService.alert(err.errorMessage, 'error'),
    );
  }

  filterMappings(searchTerm: string) {
    const text = (searchTerm || '').toLowerCase().trim();
    this.dataSource.data = this.mappings.filter(
      (m) =>
        m.projectName.toLowerCase().includes(text) ||
        this.modeNames(m).toLowerCase().includes(text),
    );
  }

  /** The allowed modes of a mapping in master order, the default marked. */
  /**
   * The allowed modes of a mapping, from the fetchAllConfigs response itself, in rank order with
   * the default marked. Names come from the masters when loaded, otherwise from built-in labels.
   */
  modeNames(mapping: ProjectConsentConfig): string {
    const context = mapping?.registration;
    if (!context || !context.enabled) {
      return '-';
    }
    const names = [...(context.modes || [])]
      .filter((m) => m && RETIRED_CONSENT_MODES.indexOf(m.mode) === -1)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((m) => ({ mode: m.mode, name: this.modeName(m.mode) }))
      .filter((m) => !!m.name)
      .map((m) =>
        m.mode === context.defaultMode ? `${m.name} (default)` : m.name,
      );
    return names.length > 0 ? names.join(', ') : '-';
  }

  /** Display name of a mode: the master's name, else a built-in label; none for an unknown mode. */
  private modeName(mode: ConsentMode): string | undefined {
    const master = (this.masters?.modes || []).find((m) => m.mode === mode);
    return master?.name || MODE_LABELS[mode];
  }

  /** Projects without a mapping, offered when adding a new one. */
  unmappedProjects(): any[] {
    return this.projectNames.filter(
      (p: any) => !this.mappings.some((m) => m.projectId === p.projectId),
    );
  }

  addMapping() {
    this.clearForm();
    this.editMode = false;
    this.filteredOptions = this.unmappedProjects();
    this.showTable = false;
  }

  editMapping(mapping: ProjectConsentConfig) {
    this.clearForm();
    this.editMode = true;
    this.showTable = false;
    const project = this.projectNames.find(
      (p: any) => p.projectId === mapping.projectId,
    ) || { projectId: mapping.projectId, projectName: mapping.projectName };
    this.project = project;
    this.loadConfig(project);
  }

  back() {
    if (!this.dirty && !this.message?.dirty) {
      this.showList();
      return;
    }
    this.confirmationService
      .confirm('Confirm', 'Discard your unsaved changes?')
      .subscribe((discard) => {
        if (discard) {
          this.showList();
        }
      });
  }

  showList() {
    this.clearForm();
    this.showTable = true;
    this.getMappings();
  }

  private clearForm() {
    this.project = null;
    this.selectedProject = null;
    this.loaded = null;
    this.rows = [];
    this.dirty = false;
  }

  /** Master modes without the retired ones, even if an older master still lists them. */
  private masterModes() {
    return (this.masters?.modes || []).filter(
      (m) => RETIRED_CONSENT_MODES.indexOf(m.mode) === -1,
    );
  }

  getProjects() {
    this.projectMasterService
      .getProjectMasters(this.serviceProviderId)
      .subscribe(
        (res: any) => {
          if (res && res.statusCode === 200) {
            this.projectNames = (res.data || []).filter(
              (p: any) => p.deleted === false,
            );
            this.filteredOptions = this.projectNames;
          } else {
            this.confirmationService.alert(res?.errorMessage, 'error');
          }
        },
        (err: any) => this.confirmationService.alert(err.errorMessage, 'error'),
      );
  }

  getMasters() {
    this.consentConfigService.getMasters(this.serviceProviderId).subscribe(
      (res: any) => {
        if (res && res.statusCode === 200) {
          this.masters = res.data;
          // The project may have loaded first, with only the fallback names.
          if (this.loaded && !this.dirty) {
            this.apply(this.loaded);
          }
        } else {
          this.confirmationService.alert(res?.errorMessage, 'error');
        }
      },
      (err: any) => this.confirmationService.alert(err.errorMessage, 'error'),
    );
  }

  displayFn(project: any) {
    return project && project.projectName ? project.projectName : '';
  }

  filterOptions(value: any) {
    const text = (typeof value === 'string' ? value : this.displayFn(value))
      .toLowerCase()
      .trim();
    this.filteredOptions = this.unmappedProjects().filter((p: any) =>
      p.projectName.toLowerCase().includes(text),
    );
  }

  onProjectSelected(project: any) {
    if (!this.dirty || !this.selectedProject) {
      this.loadConfig(project);
      return;
    }
    this.confirmationService
      .confirm('Confirm', 'Discard your unsaved changes?')
      .subscribe((discard) => {
        if (discard) {
          this.loadConfig(project);
        } else {
          this.project = this.selectedProject;
        }
      });
  }

  loadConfig(project: any) {
    this.consentConfigService
      .fetchConfig(project.projectId, this.serviceProviderId)
      .subscribe(
        (res: any) => {
          if (res && res.statusCode === 200 && res.data) {
            this.selectedProject = project;
            this.apply(res.data);
          } else {
            this.confirmationService.alert(res?.errorMessage, 'error');
          }
        },
        (err: any) => this.confirmationService.alert(err.errorMessage, 'error'),
      );
  }

  /**
   * Fills the form exactly as fetchConfigByProject returned it. A project never saved comes back
   * with version 0 and the server's own starting values.
   */
  apply(config: ProjectConsentConfig) {
    this.loaded = config;
    const context: Partial<ContextConfig> = config.registration || {};
    this.enabled = context.enabled === true;
    this.mandatory = context.mandatory === true;
    this.defaultMode =
      context.defaultMode &&
      RETIRED_CONSENT_MODES.indexOf(context.defaultMode) === -1
        ? context.defaultMode
        : null;
    const allowed = context.modes || [];
    this.rows = this.masterModes().map((m) => {
      const found = allowed.find((a) => a.mode === m.mode);
      return {
        mode: m.mode,
        name: m.name || m.mode,
        ticked: !!found,
        settings: found ? { ...found.settings } : {},
      };
    });
    this.dirty = false;
  }

  get notConfigured(): boolean {
    return !!this.loaded && this.loaded.version === 0;
  }

  get tickedRows(): ModeRow[] {
    return this.rows.filter((r) => r.ticked);
  }

  /** The default the configuration will store: the only ticked mode, or the chosen one. */
  get effectiveDefault(): ConsentMode | null {
    const ticked = this.tickedRows;
    return ticked.length === 1 ? ticked[0].mode : this.defaultMode;
  }

  toggleMode(row: ModeRow, checked: boolean) {
    row.ticked = checked;
    this.markDirty();
  }

  setDefault(mode: ConsentMode) {
    this.defaultMode = mode;
    this.markDirty();
  }

  markDirty() {
    this.dirty = true;
  }

  /** Field errors that block saving (FR-009). */
  get errors(): { modes?: string; defaultMode?: string } {
    const result: { modes?: string; defaultMode?: string } = {};
    if (!this.enabled) {
      return result;
    }
    const ticked = this.tickedRows;
    if (ticked.length === 0) {
      result.modes = 'Pick at least one consent mode';
    } else if (
      !this.effectiveDefault ||
      !ticked.some((r) => r.mode === this.effectiveDefault)
    ) {
      result.defaultMode = 'Choose a ticked mode as default';
    }
    return result;
  }

  get canSave(): boolean {
    return (
      !!this.loaded && !this.saving && Object.keys(this.errors).length === 0
    );
  }

  buildRegistration(): ContextConfig {
    const base = this.loaded as ProjectConsentConfig;
    const previous: Partial<ContextConfig> = base.registration || {};
    return {
      ...previous,
      enabled: this.enabled,
      mandatory: this.mandatory,
      modes: this.tickedRows.map((r, i) => ({
        mode: r.mode,
        rank: i + 1,
        settings: { ...r.settings },
      })),
      defaultMode: this.tickedRows.length > 0 ? this.effectiveDefault : null,
      // purposes, languages and guardian go back exactly as the server sent them.
    } as ContextConfig;
  }

  save() {
    if (!this.canSave) {
      return;
    }
    const base = this.loaded as ProjectConsentConfig;
    const reqObj: SaveConsentConfigRequest = {
      projectId: base.projectId,
      projectName: this.selectedProject?.projectName || base.projectName,
      serviceProviderId: this.serviceProviderId,
      registration: this.buildRegistration(),
      revisit: base.revisit,
    };
    const isNew = base.version === 0;
    const call = isNew
      ? this.consentConfigService.saveConfig({
          ...reqObj,
          createdBy: this.userName,
        })
      : this.consentConfigService.updateConfig({
          ...reqObj,
          baseVersion: base.version,
          modifiedBy: this.userName,
        });
    this.saving = true;
    call.subscribe(
      (res: any) => {
        this.saving = false;
        if (res && res.statusCode === 200 && res.data) {
          this.confirmationService.alert(
            `Saved, version ${res.data.version}`,
            'success',
          );
          this.showList();
        } else {
          this.confirmationService.alert(res?.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.saving = false;
        const reason = err?.error?.data?.reason;
        if (err?.status === 409 || reason === 'STALE_VERSION') {
          this.confirmationService.alert(
            'Changed by someone else, reload',
            'error',
          );
        } else {
          this.confirmationService.alert(
            err?.error?.errorMessage || err?.errorMessage || 'Could not save',
            'error',
          );
        }
      },
    );
  }

  reload() {
    if (this.selectedProject) {
      this.loadConfig(this.selectedProject);
    }
  }

  reset() {
    if (this.loaded) {
      this.apply(this.loaded);
    }
  }
}
