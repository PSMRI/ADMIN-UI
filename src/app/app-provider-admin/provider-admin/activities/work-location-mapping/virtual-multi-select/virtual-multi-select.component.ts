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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

/**
 * Multi-select for lists too large for mat-select (Stop TB Nikshay
 * facilities/villages run to 5,000+ per district). mat-select creates one
 * mat-option per item and matches every selected value against every option,
 * which froze or crashed low-end PCs. This control only renders the rows in
 * view (cdk virtual scroll) and tracks the selection as a Set of IDs.
 *
 * Works with [(ngModel)] like mat-select: the value is the array of selected
 * item objects, in list order. Angular's built-in `required` validator
 * treats an empty array as missing, so `required` works unchanged.
 */
@Component({
  selector: 'app-virtual-multi-select',
  templateUrl: './virtual-multi-select.component.html',
  styleUrls: ['./virtual-multi-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VirtualMultiSelectComponent),
      multi: true,
    },
  ],
})
export class VirtualMultiSelectComponent
  implements ControlValueAccessor, OnChanges
{
  @Input() label = '';
  @Input() items: any[] = [];
  @Input() idKey = 'id';
  @Input() labelKey = 'name';
  @Input() required: any = false;
  @Output() selectionChange = new EventEmitter<any[]>();

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  @ViewChild('searchBox') searchBox?: ElementRef<HTMLInputElement>;

  readonly itemSize = 36;
  readonly visibleRows = 8;

  isOpen = false;
  disabled = false;
  search = '';
  filtered: any[] = [];
  selectedCount = 0;
  allFilteredSelected = false;
  summary = '';
  panelWidth = 0;

  private selectedIds = new Set<any>();
  private onChange: (value: any[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private cdr: ChangeDetectorRef) {}

  get isRequired(): boolean {
    return this.required !== false && this.required !== 'false';
  }

  get viewportHeight(): number {
    const rows = Math.min(Math.max(this.filtered.length, 1), this.visibleRows);
    return rows * this.itemSize;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.applyFilter();
      this.refreshState();
    }
  }

  writeValue(value: any[]): void {
    this.selectedIds = new Set(
      (value || []).map((item: any) => item?.[this.idKey]),
    );
    this.refreshState();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  open(origin: HTMLElement): void {
    if (this.disabled || this.isOpen) return;
    this.panelWidth = origin.getBoundingClientRect().width;
    this.isOpen = true;
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.search) {
      this.search = '';
      this.applyFilter();
      this.refreshState();
    }
    this.onTouched();
  }

  onAttach(): void {
    setTimeout(() => {
      this.viewport?.checkViewportSize();
      this.searchBox?.nativeElement.focus();
    });
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  onSearch(term: string): void {
    this.search = term;
    this.applyFilter();
    this.refreshState();
    // The viewport's height follows the match count
    setTimeout(() => {
      this.viewport?.checkViewportSize();
      this.viewport?.scrollToIndex(0);
    });
  }

  isSelected(item: any): boolean {
    return this.selectedIds.has(item?.[this.idKey]);
  }

  toggle(item: any): void {
    const id = item?.[this.idKey];
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.emit();
  }

  // Applies to what the search currently shows (the whole list when the
  // search box is empty).
  toggleAll(): void {
    const select = !this.allFilteredSelected;
    this.filtered.forEach((item: any) => {
      const id = item?.[this.idKey];
      if (select) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    });
    this.emit();
  }

  trackById = (_: number, item: any): any => item?.[this.idKey];

  private emit(): void {
    const value = (this.items || []).filter((item: any) =>
      this.selectedIds.has(item?.[this.idKey]),
    );
    this.refreshState();
    this.onChange(value);
    this.selectionChange.emit(value);
  }

  private applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    const items = this.items || [];
    this.filtered = !s
      ? items
      : items.filter((item: any) =>
          String(item?.[this.labelKey] ?? '')
            .toLowerCase()
            .includes(s),
        );
  }

  // Everything the template shows is computed here once per change, not
  // per change-detection pass.
  private refreshState(): void {
    const names: string[] = [];
    let count = 0;
    for (const item of this.items || []) {
      if (this.selectedIds.has(item?.[this.idKey])) {
        count++;
        if (names.length < 3) names.push(String(item?.[this.labelKey] ?? ''));
      }
    }
    this.selectedCount = count;
    this.summary = !count
      ? ''
      : names.join(', ') +
        (count > names.length ? ` +${count - names.length} more` : '');
    this.allFilteredSelected =
      this.filtered.length > 0 &&
      this.filtered.every((item: any) =>
        this.selectedIds.has(item?.[this.idKey]),
      );
  }
}
