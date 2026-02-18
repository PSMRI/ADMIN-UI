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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LocationService } from 'src/app/core/services/common/location.service';
import { FacilityHierarchyService } from 'src/app/core/services/inventory-services/facility-hierarchy.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

@Component({
  selector: 'app-facility-hierarchy',
  templateUrl: './facility-hierarchy.component.html',
  styleUrls: ['./facility-hierarchy.component.css'],
})
export class FacilityHierarchyComponent implements OnInit {
  facilityForm!: FormGroup;

  tableMode = true;
  formMode = false;
  editMode = false;
  viewMode = false;

  facilityList: any[] = [];
  filteredFacilityList = new MatTableDataSource<any>();
  displayedColumns = ['sno', 'facilityType', 'facilityName', 'actions'];

  states: any[] = [];
  districts: any[] = [];
  taluks: any[] = [];
  facilityTypes: string[] = [
    'Primary Health Centre',
    'Community Health Centre',
    'District Hospital',
    'Sub Centre',
    'Taluk Hospital',
  ];

  filterTerm = '';
  editIndex = -1;
  createdBy: any;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private facilityHierarchyService: FacilityHierarchyService,
    private dialogService: ConfirmationDialogsService,
    private dataService: dataService,
  ) {}

  ngOnInit() {
    this.createdBy = this.dataService.uname;
    this.createForm();
    this.loadStates();
    this.loadFacilities();
  }

  createForm() {
    this.facilityForm = this.fb.group({
      state: [null, Validators.required],
      district: [null, Validators.required],
      taluk: [null, Validators.required],
      facilityType: [null, Validators.required],
      facilityName: [null, Validators.required],
      areaType: [null, Validators.required],
    });
  }

  loadStates() {
    this.locationService.getStates(1).subscribe((response: any) => {
      if (response && response.data) {
        this.states = response.data;
      }
    });
  }

  onStateChange() {
    const state = this.facilityForm.get('state')?.value;
    this.districts = [];
    this.taluks = [];
    this.facilityForm.patchValue({ district: null, taluk: null });
    if (state) {
      this.locationService
        .getDistricts(state.stateID)
        .subscribe((response: any) => {
          if (response && response.data) {
            this.districts = response.data;
          }
        });
    }
  }

  onDistrictChange() {
    const district = this.facilityForm.get('district')?.value;
    this.taluks = [];
    this.facilityForm.patchValue({ taluk: null });
    if (district) {
      this.locationService
        .getTaluks(district.districtID)
        .subscribe((response: any) => {
          if (response && response.data) {
            this.taluks = response.data;
          }
        });
    }
  }

  loadFacilities() {
    this.facilityList = this.facilityHierarchyService.getFacilities();
    this.filteredFacilityList.data = this.facilityList;
    this.filteredFacilityList.paginator = this.paginator;
  }

  filterFacilityList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredFacilityList.data = this.facilityList;
    } else {
      this.filteredFacilityList.data = this.facilityList.filter((item: any) => {
        return (
          (item.facilityType || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (item.facilityName || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }
    this.filteredFacilityList.paginator = this.paginator;
  }

  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.viewMode = false;
    this.editIndex = -1;
    this.filterTerm = '';
    this.loadFacilities();
  }

  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
    this.viewMode = false;
    this.facilityForm.reset();
    this.districts = [];
    this.taluks = [];
  }

  showViewMode(item: any, index: number) {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = false;
    this.viewMode = true;
    this.editIndex = index;
    this.populateForm(item);
    this.facilityForm.disable();
  }

  showEditMode(item: any, index: number) {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
    this.viewMode = false;
    this.editIndex = index;
    this.facilityForm.enable();
    this.populateForm(item);
  }

  populateForm(item: any) {
    this.districts = item._districts || [];
    this.taluks = item._taluks || [];
    this.facilityForm.patchValue({
      state: item._state || null,
      district: item._district || null,
      taluk: item._taluk || null,
      facilityType: item.facilityType,
      facilityName: item.facilityName,
      areaType: item.areaType,
    });
  }

  saveFacility() {
    if (this.facilityForm.valid) {
      const formValue = this.facilityForm.value;
      const facility = {
        facilityType: formValue.facilityType,
        facilityName: formValue.facilityName,
        areaType: formValue.areaType,
        stateName: formValue.state?.stateName,
        districtName: formValue.district?.districtName,
        talukName: formValue.taluk?.blockName,
        createdBy: this.createdBy,
        _state: formValue.state,
        _district: formValue.district,
        _taluk: formValue.taluk,
        _districts: this.districts,
        _taluks: this.taluks,
      };
      this.facilityHierarchyService.addFacility(facility);
      this.dialogService.alert('Saved successfully', 'success');
      this.showTable();
    }
  }

  updateFacility() {
    if (this.facilityForm.valid && this.editIndex >= 0) {
      const formValue = this.facilityForm.value;
      const facility = {
        facilityType: formValue.facilityType,
        facilityName: formValue.facilityName,
        areaType: formValue.areaType,
        stateName: formValue.state?.stateName,
        districtName: formValue.district?.districtName,
        talukName: formValue.taluk?.blockName,
        modifiedBy: this.createdBy,
        _state: formValue.state,
        _district: formValue.district,
        _taluk: formValue.taluk,
        _districts: this.districts,
        _taluks: this.taluks,
      };
      this.facilityHierarchyService.updateFacility(this.editIndex, facility);
      this.dialogService.alert('Updated successfully', 'success');
      this.showTable();
    }
  }
}
