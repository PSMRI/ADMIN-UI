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
import { Component, OnInit } from '@angular/core';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  ConsentConfigMasters,
  ConsentConfigurationService,
  ConsentMode,
  ContextConfig,
  ModeSettings,
  ProjectConsentConfig,
  SaveConsentConfigRequest,
} from '../services/consent-configuration.service';
import { ProjectMasterService } from '../services/project-master-service.service';

/** One row of the modes table; the table order is the display order. */
export interface ModeRow {
  mode: ConsentMode;
  name: string;
  ticked: boolean;
  settings: ModeSettings;
}

/** Feature 001 behaviour, shown for a project that was never configured. */
export function platformDefault(): ContextConfig {
  return {
    enabled: true,
    mandatory: true,
    modes: [],
    defaultMode: null,
    purposes: [],
    languages: [],
    guardian: { enabled: true, ageThreshold: 18 },
  };
}

@Component({
  selector: 'app-consent-configuration',
  templateUrl: './consent-configuration.component.html',
  styleUrls: ['./consent-configuration.component.css'],
})
export class ConsentConfigurationComponent implements OnInit {
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
    this.filteredOptions = this.projectNames.filter((p: any) =>
      p.projectName.toLowerCase().includes(text),
    );
  }

  /** "Configured vN" or "Not configured" for the picker (FR-002). */
  projectStatus(project: any): string {
    const found = (this.masters?.projects || []).find(
      (p) => p.projectId === project.projectId,
    );
    return found && found.version > 0
      ? `Configured v${found.version}`
      : 'Not configured';
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

  /** Fills the form from a stored configuration; version 0 shows the platform default. */
  apply(config: ProjectConsentConfig) {
    this.loaded = config;
    const context =
      config.version > 0 ? config.registration : platformDefault();
    this.enabled = context.enabled;
    this.mandatory = context.mandatory;
    this.defaultMode = context.defaultMode;
    const allowed = [...(context.modes || [])].sort((a, b) => a.rank - b.rank);
    const masterModes = this.masters?.modes || [];
    const nameOf = (mode: ConsentMode) =>
      masterModes.find((m) => m.mode === mode)?.name || mode;
    const ticked: ModeRow[] = allowed
      .filter((m) => masterModes.some((x) => x.mode === m.mode))
      .map((m) => ({
        mode: m.mode,
        name: nameOf(m.mode),
        ticked: true,
        settings: { ...m.settings },
      }));
    const rest: ModeRow[] = masterModes
      .filter((m) => !ticked.some((t) => t.mode === m.mode))
      .map((m) => ({
        mode: m.mode,
        name: m.name,
        ticked: config.version === 0,
        settings: {},
      }));
    this.rows = ticked.concat(rest);
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

  move(index: number, step: -1 | 1) {
    const target = index + step;
    if (target < 0 || target >= this.rows.length) {
      return;
    }
    const rows = [...this.rows];
    [rows[index], rows[target]] = [rows[target], rows[index]];
    this.rows = rows;
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
    const previous = base.version > 0 ? base.registration : platformDefault();
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
    };
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
          this.apply(res.data);
          this.updateProjectVersion(res.data.projectId, res.data.version);
          this.confirmationService.alert(
            `Saved, version ${res.data.version}`,
            'success',
          );
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

  private updateProjectVersion(projectId: number, version: number) {
    if (!this.masters) {
      return;
    }
    const others = this.masters.projects.filter(
      (p) => p.projectId !== projectId,
    );
    this.masters = {
      ...this.masters,
      projects: others.concat([{ projectId, version }]),
    };
  }
}
