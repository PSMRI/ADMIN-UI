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
  Component,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DrugStrengthService } from '../../inventory/services/drug-strength.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-drug-strength',
  templateUrl: './drug-strength.component.html',
  styleUrls: ['./drug-strength.component.css'],
})
export class DrugStrengthComponent implements OnInit, AfterViewInit {
  createdBy: any;
  strength: any;
  strength_desc: any;
  drugStrengthID: any;
  confirmMessage: any;
  drugStrengthExist: any;

  /*Arrays*/
  drugStrength: any = [];
  availableStrengths: any = [];

  tableMode = true;
  formMode = false;
  editMode = false;
  displayedColumns = [
    'sno',
    'drugStrength',
    'drugStrengthDesc',
    'edit',
    'action',
  ];

  displayAddedColumns = ['sno', 'drugStrength', 'drugStrengthDesc', 'action'];
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  filteredDrugStrength = new MatTableDataSource<any>();
  drugStrengthList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;

  @ViewChild('drugStrengthForm') drugStrengthForm!: NgForm;

  constructor(
    public drugStrengthService: DrugStrengthService,
    public data_service: dataService,
    public alertService: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.data_service.uname;
    this.getAllDrugStrength();
  }
  getAllDrugStrength() {
    this.drugStrengthService.getDrugStrength().subscribe(
      (response: any) => {
        if (response) {
          console.log('drug strength', response);
          this.drugStrength = response.data;
          this.filteredDrugStrength.data = response.data;
          for (const availableStrength of this.drugStrength) {
            this.availableStrengths.push(availableStrength.drugStrength);
          }
        }
      },
      (err) => console.log('error', err),
    );
  }

  ngAfterViewInit() {
    this.filteredDrugStrength.paginator = this.paginatorFirst;
  }

  checkStrengthAvailability(strength: any) {
    this.drugStrengthExist = this.availableStrengths.includes(strength);
    console.log('drugStrengthExist', this.drugStrengthExist);
  }

  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
  }

  add_object(formValue: any) {
    console.log('form values', formValue);
    const tempDrugStrengthObj = {
      drugStrength:
        formValue.strength !== undefined && formValue.strength !== null
          ? formValue.strength.trim()
          : null,
      drugStrengthDesc:
        formValue.strength_desc !== undefined &&
        formValue.strength_desc !== null
          ? formValue.strength_desc.trim()
          : null,
      createdBy: this.createdBy,
      serviceProviderID: this.sessionstorage.getItem('service_providerID'),
    };
    this.checkDuplicates(tempDrugStrengthObj);
    this.drugStrengthForm.resetForm();
  }

  checkDuplicates(object: any) {
    let duplicateStatus = 0;
    if (this.drugStrengthList.data.length === 0) {
      this.drugStrengthList.data.push(object);
    } else {
      for (let i = 0; i < this.drugStrengthList.data.length; i++) {
        if (
          this.drugStrengthList.data[i].drugStrength === object.drugStrength
        ) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        // Add object to the data array using spread operator
        this.drugStrengthList.data = [...this.drugStrengthList.data, object];
      } else {
        this.alertService.alert('Already exists');
      }
    }
  }

  saveDrugStrength() {
    console.log('request object', this.drugStrengthList);
    this.drugStrengthService
      .saveDrugStrength(this.drugStrengthList.data)
      .subscribe(
        (response: any) => this.successHandler(response),
        (err) => {
          console.log('error', err);
        },
      );
  }

  successHandler(response: any) {
    this.drugStrengthList.data = [];
    this.alertService.alert('Saved successfully', 'success');
    this.redirectToMainPage();
  }

  remove_obj(index: any) {
    const newData = [...this.drugStrengthList.data];
    newData.splice(index, 1);
    this.drugStrengthList.data = newData;
    this.cdr.detectChanges();
  }

  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.drugStrengthForm.resetForm();
          this.drugStrengthList.data = [];
          this.redirectToMainPage();
        }
      });
  }

  redirectToMainPage() {
    this.getAllDrugStrength();
    this.tableMode = true;
    this.formMode = false;
    this.drugStrengthForm.resetForm();
  }

  editDrugStrength(data: any) {
    console.log('edit values', data);
    this.editMode = true;
    this.tableMode = false;
    this.formMode = true;
    this.strength = data.drugStrength;
    this.strength_desc = data.drugStrengthDesc;
    this.drugStrengthID = data.drugStrengthID;
  }

  updateDrugStrength() {
    const updateDrugStrengthObj = {
      drugStrengthID: this.drugStrengthID,
      drugStrength:
        this.strength !== undefined && this.strength !== null
          ? this.strength.trim()
          : null,
      drugStrengthDesc:
        this.strength_desc !== undefined && this.strength_desc !== null
          ? this.strength_desc.trim()
          : null,
      modifiedBy: this.createdBy,
      serviceProviderID: this.sessionstorage.getItem('service_providerID'),
    };
    this.drugStrengthService
      .updateDrugStrength(updateDrugStrengthObj)
      .subscribe(
        (updateResponse) => this.updateSuccessHandler(updateResponse),
        (err) => {
          console.log('error', err);
        },
      );
  }

  updateSuccessHandler(updateResponse: any) {
    this.alertService.alert('Updated successfully', 'success');
    this.redirectToMainPage();
  }

  activateDeactivate(drugStrengthID: any, flag: any) {
    const obj = {
      drugStrengthID: drugStrengthID,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.alertService
      .confirm(
        'Confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            console.log('Deactivating or activating Obj', obj);
            this.drugStrengthService
              .drugStrengthActivationDeactivation(obj)
              .subscribe(
                (res) => {
                  console.log('Activation or deactivation response', res);
                  this.alertService.alert(
                    this.confirmMessage + 'd successfully',
                    'success',
                  );
                  this.getAllDrugStrength();
                },
                (err) => console.log('error', err),
              );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredDrugStrength.data = this.drugStrength;
      this.filteredDrugStrength.paginator = this.paginator;
      this.filteredDrugStrength.sort = this.sort;
    } else {
      this.filteredDrugStrength.data = [];
      this.filteredDrugStrength.paginator = this.paginator;
      this.filteredDrugStrength.sort = this.sort;
      this.drugStrength.forEach((item: any) => {
        for (const key in item) {
          if (key === 'drugStrength') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredDrugStrength.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}
