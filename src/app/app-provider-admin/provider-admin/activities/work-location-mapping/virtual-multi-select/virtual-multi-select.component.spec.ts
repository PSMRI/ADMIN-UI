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
import { Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { VirtualMultiSelectComponent } from './virtual-multi-select.component';

// Pune MC-sized list: the size that froze low-end PCs with mat-select.
const BIG = Array.from({ length: 5327 }, (_, i) => ({
  nikshayFacilityID: i + 1,
  facilityName: `Facility ${String(i + 1).padStart(4, '0')}`,
}));

@Component({
  template: `
    <form #form="ngForm">
      <app-virtual-multi-select
        label="Select Health Facility"
        [items]="items"
        idKey="nikshayFacilityID"
        labelKey="facilityName"
        [(ngModel)]="selected"
        name="facilities"
        (selectionChange)="changes = changes + 1"
        required
      ></app-virtual-multi-select>
    </form>
  `,
})
class HostComponent {
  @ViewChild(VirtualMultiSelectComponent) picker!: VirtualMultiSelectComponent;
  @ViewChild('form') form!: NgForm;
  items: any[] = BIG;
  selected: any[] = [];
  changes = 0;
}

describe('VirtualMultiSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let overlay: HTMLElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NoopAnimationsModule,
        OverlayModule,
        ScrollingModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
      ],
      declarations: [VirtualMultiSelectComponent, HostComponent],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
  }));

  function openPanel() {
    const origin = fixture.nativeElement.querySelector('.vms-origin');
    origin.click();
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
  }

  it('renders only the visible rows of a 5,327-item list', fakeAsync(() => {
    openPanel();
    const rows = overlay.querySelectorAll('.vms-option').length;
    expect(rows).toBeGreaterThan(0);
    expect(rows).toBeLessThan(50);
  }));

  it('Select All picks every item, in list order, and updates ngModel', fakeAsync(() => {
    openPanel();
    (overlay.querySelector('.vms-actions a') as HTMLElement).click();
    fixture.detectChanges();
    flush();

    expect(host.selected.length).toBe(5327);
    expect(host.selected[0]).toBe(BIG[0]);
    expect(host.selected[5326]).toBe(BIG[5326]);
    expect(host.changes).toBe(1);
    expect(host.picker.summary).toContain('+5324 more');
  }));

  it('Select All with a search only picks the matching items', fakeAsync(() => {
    openPanel();
    const search = overlay.querySelector(
      '.vms-search input',
    ) as HTMLInputElement;
    search.value = 'Facility 00';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    (overlay.querySelector('.vms-actions a') as HTMLElement).click();
    fixture.detectChanges();
    flush();

    // Facility 0001 .. Facility 0099
    expect(host.selected.length).toBe(99);
    expect(
      host.selected.every((f: any) => f.facilityName.startsWith('Facility 00')),
    ).toBeTrue();
  }));

  it('clicking a row toggles it', fakeAsync(() => {
    openPanel();
    const row = () => overlay.querySelector('.vms-option') as HTMLElement;
    row().click();
    fixture.detectChanges();
    flush();
    expect(host.selected).toEqual([BIG[0]]);

    row().click();
    fixture.detectChanges();
    flush();
    expect(host.selected).toEqual([]);
  }));

  it('shows a value set from the parent (Edit prefill)', fakeAsync(() => {
    host.selected = [BIG[4], BIG[9]];
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(host.picker.selectedCount).toBe(2);
    expect(host.picker.summary).toBe('Facility 0005, Facility 0010');
    expect(host.picker.isSelected(BIG[4])).toBeTrue();
    expect(host.picker.isSelected(BIG[5])).toBeFalse();
  }));

  it('keeps the form invalid until something is selected (required)', fakeAsync(() => {
    expect(host.form.valid).toBeFalse();

    openPanel();
    (overlay.querySelector('.vms-option') as HTMLElement).click();
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(host.form.valid).toBeTrue();
  }));
});
