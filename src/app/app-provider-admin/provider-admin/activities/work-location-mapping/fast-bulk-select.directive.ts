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
import { Directive, Self } from '@angular/core';
import { MatSelect } from '@angular/material/select';

/**
 * Bulk selection for very large multi-selects (Stop TB Nikshay TU/Facility/
 * Village lists hold up to 6,167 options).
 *
 * Whenever the bound value is replaced (Select All, Deselect All, Edit
 * prefill) or the option list changes (list reload, search filter),
 * mat-select re-selects every value one by one: a linear search per value,
 * then a full re-sort after each selected option. That is quadratic and froze
 * low-end PCs for 5-45 s on large districts. This replaces only that step:
 * values are matched to options through a Map and the selection is sorted
 * once at the end. The resulting selection and its order are the same, and
 * single clicks still go through mat-select unchanged.
 *
 * Assumes mat-select's default identity compareWith (none of the Nikshay
 * selects set one). If Material's internals change, nothing is patched and
 * mat-select's own code runs.
 */
@Directive({
  selector: 'mat-select[appFastBulkSelect]',
})
export class FastBulkSelectDirective {
  constructor(@Self() select: MatSelect) {
    const s: any = select;
    const original = s._setSelectionByValue;
    if (typeof original !== 'function' || typeof s._sortValues !== 'function') {
      return;
    }
    s._setSelectionByValue = function (value: any) {
      if (
        !this.multiple ||
        !Array.isArray(value) ||
        !this.options ||
        !this._selectionModel
      ) {
        return original.call(this, value);
      }
      const sortValues = this._sortValues;
      // Every option selected below triggers a full re-sort; sort once instead.
      this._sortValues = () => undefined;
      try {
        this.options.forEach((option: any) => option.setInactiveStyles());
        this._selectionModel.clear();
        const optionByValue = new Map<any, any>();
        this.options.forEach((option: any) => {
          const v = option.value;
          if (v !== null && v !== undefined && !optionByValue.has(v)) {
            optionByValue.set(v, option);
          }
        });
        const matched = new Set<any>();
        value.forEach((v: any) => {
          const option = optionByValue.get(v);
          if (option) matched.add(option);
        });
        if (matched.size) this._selectionModel.select(...matched);
      } finally {
        this._sortValues = sortValues;
      }
      this._sortValues();
      this._changeDetectorRef.markForCheck();
    };
  }
}
