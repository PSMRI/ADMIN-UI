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
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  NikshayBeneficiaryListService,
  NikshayPhaseJobSetting,
} from '../services/nikshay-beneficiary-list.service';

type ScheduleFrequency = 'MINUTES' | 'HOURLY' | 'DAILY';

const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: 'MINUTES', label: 'Every few minutes' },
  { value: 'HOURLY', label: 'Every few hours' },
  { value: 'DAILY', label: 'Daily' },
];

const MINUTE_INTERVALS = [5, 10, 15, 20, 30];
const HOUR_INTERVALS = [1, 2, 3, 4, 6, 8, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const pad = (value: number) => String(value).padStart(2, '0');

/** "14:05" -> "02:05 PM" */
const formatTime = (hour: number, minute: number) =>
  `${pad(hour % 12 || 12)}:${pad(minute)} ${hour < 12 ? 'AM' : 'PM'}`;

@Component({
  selector: 'app-nikshay-phase-config',
  templateUrl: './nikshay-phase-config.component.html',
  styleUrls: ['./nikshay-phase-config.component.css'],
})
export class NikshayPhaseConfigComponent implements OnInit {
  readonly frequencyOptions = FREQUENCY_OPTIONS;
  readonly minuteIntervals = MINUTE_INTERVALS;
  readonly hourIntervals = HOUR_INTERVALS;
  readonly minutes = MINUTES;
  readonly hours = HOURS;
  readonly pad = pad;
  readonly formatHour = (hour: number) =>
    `${pad(hour % 12 || 12)} ${hour < 12 ? 'AM' : 'PM'}`;

  /** The setting as last loaded or saved on the server. */
  jobSetting: NikshayPhaseJobSetting | null = null;
  /** Saved cron that the picker can't show, e.g. one set outside this screen. */
  unsupportedCron: string | null = null;
  isLoadingJobSetting = false;
  isSavingJobSetting = false;

  /** Unsaved values in the form; together they build the cron expression. */
  isJobEnabled = false;
  frequency: ScheduleFrequency = 'DAILY';
  minuteInterval = 15;
  hourInterval = 1;
  minute = 0;
  hour = 2;

  constructor(
    private nikshayBeneficiaryListService: NikshayBeneficiaryListService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.loadJobSetting();
  }

  loadJobSetting() {
    this.isLoadingJobSetting = true;
    this.nikshayBeneficiaryListService.getPhaseJobSetting().subscribe(
      (setting) => {
        this.isLoadingJobSetting = false;
        this.setJobSetting(setting);
      },
      (err: any) => {
        this.isLoadingJobSetting = false;
        this.dialogService.alert(
          err?.errorMessage ||
            'Could not load the job setting. Please try again.',
          'error',
        );
      },
    );
  }

  setJobSetting(setting: NikshayPhaseJobSetting) {
    this.jobSetting = setting;
    this.isJobEnabled = !!setting?.enabled;
    const cron = setting?.cronExpression;
    this.unsupportedCron = cron && !this.applyCron(cron) ? cron : null;
  }

  /** Spring cron (second minute hour day-of-month month day-of-week) from the picker. */
  get cronExpression(): string {
    switch (this.frequency) {
      case 'MINUTES':
        return `0 */${this.minuteInterval} * * * *`;
      case 'HOURLY':
        return this.hourInterval === 1
          ? `0 ${this.minute} * * * *`
          : `0 ${this.minute} */${this.hourInterval} * * *`;
      default:
        return `0 ${this.minute} ${this.hour} * * *`;
    }
  }

  get scheduleDescription(): string {
    const time = formatTime(this.hour, this.minute);
    switch (this.frequency) {
      case 'MINUTES':
        return `Runs every ${this.minuteInterval} minutes`;
      case 'HOURLY':
        return this.hourInterval === 1
          ? `Runs every hour at ${pad(this.minute)} minutes past the hour`
          : `Runs every ${this.hourInterval} hours at ${pad(this.minute)} minutes past the hour`;
      default:
        return `Runs every day at ${time}`;
    }
  }

  get hasChanges(): boolean {
    const savedCron = this.jobSetting?.cronExpression || null;
    // With no saved schedule, the picker's default only counts once the job is on
    const cronChanged = savedCron
      ? this.cronExpression !== savedCron
      : this.isJobEnabled;
    return this.isJobEnabled !== !!this.jobSetting?.enabled || cronChanged;
  }

  get canSave(): boolean {
    return this.hasChanges && !this.isSavingJobSetting;
  }

  /** Fills the picker from a cron it can build; false for anything else. */
  applyCron(cron: string): boolean {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek, ...rest] = cron
      .trim()
      .split(/\s+/);
    if (second !== '0' || month !== '*' || rest.length || !dayOfWeek) {
      return false;
    }
    const num = (v: string, allowed: number[]) =>
      /^\d+$/.test(v) && allowed.includes(+v) ? +v : null;
    const step = (v: string, allowed: number[]) =>
      v.startsWith('*/') ? num(v.slice(2), allowed) : null;

    const minuteInterval = step(minute, MINUTE_INTERVALS);
    if (
      minuteInterval !== null &&
      hour === '*' &&
      dayOfMonth === '*' &&
      dayOfWeek === '*'
    ) {
      this.frequency = 'MINUTES';
      this.minuteInterval = minuteInterval;
      return true;
    }

    const m = num(minute, MINUTES);
    if (m === null) return false;
    const hourInterval = hour === '*' ? 1 : step(hour, HOUR_INTERVALS);
    if (hourInterval !== null && dayOfMonth === '*' && dayOfWeek === '*') {
      this.frequency = 'HOURLY';
      this.hourInterval = hourInterval;
      this.minute = m;
      return true;
    }

    const h = num(hour, HOURS);
    if (h === null || dayOfMonth !== '*' || dayOfWeek !== '*') return false;
    this.frequency = 'DAILY';
    this.minute = m;
    this.hour = h;
    return true;
  }

  resetJobSetting() {
    if (this.jobSetting) this.setJobSetting(this.jobSetting);
  }

  saveJobSetting() {
    this.isSavingJobSetting = true;
    this.nikshayBeneficiaryListService
      .updatePhaseJobSetting({
        enabled: this.isJobEnabled,
        cron: this.cronExpression,
      })
      .subscribe(
        (setting) => {
          this.isSavingJobSetting = false;
          this.setJobSetting(setting);
          this.dialogService.alert('Job setting saved successfully', 'success');
        },
        (err: any) => {
          this.isSavingJobSetting = false;
          this.dialogService.alert(
            err?.errorMessage ||
              'Could not save the job setting. Please try again.',
            'error',
          );
        },
      );
  }
}
