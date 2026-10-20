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
import {
  AfterContentInit,
  ContentChild,
  Directive,
  OnDestroy,
  Self,
} from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';

/**
 * Bulk selection for very large multi-selects (Stop TB Nikshay TU/Facility/
 * Village lists: thousands of options, and on UAT 1 lakh+ villages in one
 * district).
 *
 * 1. Whenever the bound value is replaced (Select All, Deselect All, Edit
 *    prefill) or the option list changes (list reload, search filter),
 *    mat-select re-selects every value one by one: a linear search per value,
 *    then a full re-sort after each selected option. That is quadratic and
 *    froze low-end PCs for 5-45 s on large districts. Here values are matched
 *    to options through a Map/Set and the selection is sorted once.
 *
 * 2. When the options sit in a <cdk-virtual-scroll-viewport>, only the rows
 *    on screen exist as mat-options, but mat-select assumes every option is
 *    rendered: on a click it would emit only the rendered selected options
 *    (dropping everything scrolled away) and it would show the field as empty
 *    when none of the selected rows are on screen. In that case this keeps
 *    the full bound value: a click adds/removes just the clicked option's
 *    value, `empty` reflects the full value, and the viewport is measured when
 *    the panel opens. Use a <mat-select-trigger> for the label text.
 *
 * Assumes mat-select's default identity compareWith (none of the Nikshay
 * selects set one), and that sortComparator reads only `.value`. If
 * Material's internals change, nothing is patched and mat-select's own code
 * runs.
 */
@Directive({
  selector: 'mat-select[appFastBulkSelect]',
})
export class FastBulkSelectDirective implements AfterContentInit, OnDestroy {
  @ContentChild(CdkVirtualScrollViewport, { descendants: true })
  viewport?: CdkVirtualScrollViewport;

  private openSub?: Subscription;

  constructor(@Self() private select: MatSelect) {
    const s: any = select;
    const originalSetSelection = s._setSelectionByValue;
    const originalPropagate = s._propagateChanges;
    const originalOnSelect = s._onSelect;
    if (
      typeof originalSetSelection !== 'function' ||
      typeof originalPropagate !== 'function' ||
      typeof originalOnSelect !== 'function' ||
      typeof s._sortValues !== 'function'
    ) {
      return;
    }
    const isVirtual = () => !!this.viewport;

    // Set of the current bound value, rebuilt only when the array changes
    // (virtual lists re-sync the selection on every scroll).
    let valueRef: any[] | null = null;
    let valueSet = new Set<any>();
    const setOf = (value: any[]) => {
      if (value !== valueRef) {
        valueRef = value;
        valueSet = new Set(value);
      }
      return valueSet;
    };

    s._setSelectionByValue = function (value: any) {
      if (
        !this.multiple ||
        !Array.isArray(value) ||
        !this.options ||
        !this._selectionModel
      ) {
        return originalSetSelection.call(this, value);
      }
      const sortValues = this._sortValues;
      // Every option selected below triggers a full re-sort; sort once instead.
      this._sortValues = () => undefined;
      try {
        this.options.forEach((option: any) => option.setInactiveStyles());
        this._selectionModel.clear();
        const matched = new Set<any>();
        if (isVirtual()) {
          // Few rendered options, possibly 1 lakh+ values: walk the options.
          const selected = setOf(value);
          this.options.forEach((option: any) => {
            if (selected.has(option.value)) matched.add(option);
          });
        } else {
          const optionByValue = new Map<any, any>();
          this.options.forEach((option: any) => {
            const v = option.value;
            if (v !== null && v !== undefined && !optionByValue.has(v)) {
              optionByValue.set(v, option);
            }
          });
          value.forEach((v: any) => {
            const option = optionByValue.get(v);
            if (option) matched.add(option);
          });
        }
        if (matched.size) this._selectionModel.select(...matched);
      } finally {
        this._sortValues = sortValues;
      }
      this._sortValues();
      this._changeDetectorRef.markForCheck();
    };

    // Remember which option a click toggled, so the full value can be
    // updated for just that option.
    let toggled: any = null;
    s._onSelect = function (option: any, isUserInput: boolean) {
      toggled = option;
      try {
        return originalOnSelect.call(this, option, isUserInput);
      } finally {
        toggled = null;
      }
    };

    s._propagateChanges = function (fallbackValue: any) {
      if (!isVirtual() || !this.multiple || !toggled) {
        return originalPropagate.call(this, fallbackValue);
      }
      const value = toggled.value;
      const next: any[] = Array.isArray(this._value) ? [...this._value] : [];
      const at = next.indexOf(value);
      if (toggled.selected && at === -1) {
        // Insert at the position mat-select's own sort would give it.
        const cmp = this.sortComparator;
        let i = next.length;
        if (cmp) {
          let lo = 0;
          let hi = next.length;
          while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (cmp({ value: next[mid] }, { value }, []) <= 0) lo = mid + 1;
            else hi = mid;
          }
          i = lo;
        }
        next.splice(i, 0, value);
      } else if (!toggled.selected && at !== -1) {
        next.splice(at, 1);
      }
      this._value = next;
      this.valueChange.emit(next);
      this._onChange(next);
      this.selectionChange.emit(this._getChangeEvent(next));
      this._changeDetectorRef.markForCheck();
    };

    // The selected rows may all be scrolled away; the field is only empty
    // when the bound value is.
    const emptyDescriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(s),
      'empty',
    );
    if (emptyDescriptor?.get) {
      const originalEmpty = emptyDescriptor.get;
      Object.defineProperty(s, 'empty', {
        configurable: true,
        get() {
          if (isVirtual() && s.multiple) {
            return !(Array.isArray(s._value) && s._value.length);
          }
          return originalEmpty.call(s);
        },
      });
    }
  }

  ngAfterContentInit() {
    // The viewport is created while the panel is closed (zero size); measure
    // it once the panel is open, starting from the top like a normal list.
    this.openSub = this.select.openedChange.subscribe((open: boolean) => {
      if (open && this.viewport) {
        this.viewport.checkViewportSize();
        this.viewport.scrollToIndex(0);
      }
    });
  }

  ngOnDestroy() {
    this.openSub?.unsubscribe();
  }
}
