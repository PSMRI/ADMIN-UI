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
import { NgForm } from '@angular/forms';
import { NatureOfCompaintCategoryMappingService } from '../services/nature-of-complaint-category-mapping.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';
@Component({
  selector: 'app-nature-of-complaint-category-mapping',
  templateUrl: './nature-of-complaint-category-mapping.component.html',
  styleUrls: ['./nature-of-complaint-category-mapping.component.css'],
})
export class NatureOfComplaintCategoryMappingComponent implements OnInit {
  [x: string]: any;
  filteredMappings = new MatTableDataSource<any>();
  complaintCategoryMappingList = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;

  serviceline: any;
  state: any;
  feedbacktype: any;
  complaintType: any;
  category: any;
  userID: any;
  oldCategoryID: any;
  createdBy: any;
  showListOfCategorymapping = true;
  showTable = false;
  disableSelection = false;
  editable: any = false;
  createButton = false;
  editCategoryMappingValues: any;

  /*Arrays*/
  servicelines: any = [];
  states: any = [];
  feedbackTypes: any = [];
  natureTypes: any = [];
  mappings: any = [];
  categories: any = [];
  // complaintCategoryMappingList: any = [];
  existingCategory: any = [];
  availableCategory: any = [];
  bufferArrayList: any = [];
  // filteredMappings: any = [];

  @ViewChild('categoryForm')
  categoryForm!: NgForm;
  @ViewChild('searchForm')
  searchForm!: NgForm;
  displayedColumns: string[] = [
    'SNo',
    'NatureOfComplaint',
    'Category',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = [
    'SNo',
    'NatureOfComplaint',
    'Category',
    'edit',
  ];

  constructor(
    public commonDataService: dataService,
    public complaintMappingService: NatureOfCompaintCategoryMappingService,
    public dialog: MatDialog,
    private alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.userID = this.sessionstorage.getItem('uid');
    this.createdBy = this.commonDataService.uname;
    this.getServicelines();
  }

  getServicelines() {
    this.complaintMappingService
      .getServiceLines(this.userID)
      .subscribe((response: any) => {
        this.getServicesSuccessHandeler(response),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
          };
      });
  }
  getServicesSuccessHandeler(response: any) {
    this.servicelines = response.data.filter(function (item: any) {
      console.log('item', item);
      if (item.serviceID === 3 || item.serviceID === 1) return item;
    });
  }

  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.complaintMappingService.getStates(obj).subscribe((response: any) => {
      this.getStatesSuccessHandeler(response),
        (err: any) => {
          console.log('error in fetching states', err);
        };
    });
  }
  getStatesSuccessHandeler(response: any) {
    this.states = response.data;
    this.createButton = false;
  }

  getFeedbackTypes(providerServiceMapID: any) {
    this.mappings = [];
    this.filteredMappings.data = [];
    this.searchForm.controls['complaintType'].reset();
    this.complaintMappingService
      .getFeedbackTypes(providerServiceMapID)
      .subscribe(
        (response: any) => {
          this.feedbackTypes = response.data;
          this.createButton = false;
        },
        (err) => {
          console.log('Error', err);
        },
      );
  }

  getFeedbackNature(feedbackTypeID: any) {
    this.mappings = [];
    this.filteredMappings.data = [];
    const tempObj = {
      feedbackTypeID: feedbackTypeID,
    };
    this.complaintMappingService.getFeedbackNatureTypes(tempObj).subscribe(
      (response: any) => {
        console.log('Feedback Nature Types', response);
        this.natureTypes = response.data;
        this.createButton = false;
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  getComplaintTypeCategoryMapping(
    providerServiceMapID: any,
    feedbackNatureID: any,
  ) {
    const reqObj = {
      providerServiceMapID: providerServiceMapID,
      feedbackNatureID: feedbackNatureID,
    };
    this.complaintMappingService.getMapping(reqObj).subscribe(
      (response: any) => {
        console.log('Mappings', response);
        this.mappings = response.data;
        this.filteredMappings.data = response.data;
        this.showTable = true;
        this.createButton = true;
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  showForm() {
    this.showTable = false;
    this.showListOfCategorymapping = false;
    this.disableSelection = true;
    this.getCategories(this.state.providerServiceMapID);
  }

  getCategories(providerServiceMapID: any) {
    this.complaintMappingService.getAllCategory(providerServiceMapID).subscribe(
      (response: any) => {
        console.log('Mappings', response);
        this.categories = response.data;
        if (this.categories) {
          this.checkExistance(providerServiceMapID);
        }
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  checkExistance(providerServiceMapID: any) {
    this.complaintMappingService
      .filterMappedCategory(providerServiceMapID)
      .subscribe((response: any) => {
        this.availableCategory = response.data;
        console.log('availableCategory', this.availableCategory);
        if (!this.editable) {
          if (this.complaintCategoryMappingList.data.length > 0) {
            this.complaintCategoryMappingList.data.forEach(
              (complaintMappingList: any) => {
                this.bufferArrayList.push(complaintMappingList.categoryID);
              },
            );
          }
          const bufferTemp: any = [];
          this.availableCategory.forEach((bufferCategory: any) => {
            const index = this.bufferArrayList.indexOf(
              bufferCategory.categoryID,
            );
            if (index < 0) {
              bufferTemp.push(bufferCategory);
            }
          });
          this.availableCategory = bufferTemp.slice();
          this.bufferArrayList = [];
        }
        // on edit - populate the non mapped categories
        else {
          if (this.editCategoryMappingValues !== undefined) {
            const tempCategory = this.categories.filter(
              (categoryResponse: any) => {
                if (
                  this.editCategoryMappingValues.categoryID ===
                    categoryResponse.categoryID &&
                  this.editCategoryMappingValues.feedbackNatureID ===
                    this.complaintType.feedbackNatureID
                ) {
                  return categoryResponse;
                }
              },
            )[0];
            if (tempCategory) {
              this.category = tempCategory;
              this.availableCategory.push(tempCategory); // patching the mapped category in ng-model
            }
          }
        }
      });
  }

  addMappingObject(categoryValue: any) {
    const mappingObj = {
      feedbackNatureID: this.complaintType.feedbackNatureID,
      feedbackNature: this.complaintType.feedbackNature,
      categoryName: categoryValue.categoryName,
      categoryID: categoryValue.categoryID,
    };
    this.complaintCategoryMappingList.data.push(mappingObj);
    this.categoryForm.resetForm();
    this.checkExistance(this.state.providerServiceMapID);
  }

  remove_obj(index: any) {
    this.complaintCategoryMappingList.data.splice(index, 1);
    this.showForm();
  }

  saveCategoryMapping() {
    console.log(
      'complaintCategoryMappingList',
      this.complaintCategoryMappingList,
    );
    const tempObj = this.complaintCategoryMappingList.data;
    this.complaintMappingService
      .saveComplaintToCategoryMapping(tempObj)
      .subscribe((response: any) => this.successHandler(response));
  }
  successHandler(response: any) {
    this.alertService.alert('Mapping saved successfully', 'success');
    this.showList();
  }

  showList() {
    this.getComplaintTypeCategoryMapping(
      this.state.providerServiceMapID,
      this.complaintType.feedbackNatureID,
    );
    this.showListOfCategorymapping = true;
    this.disableSelection = false;
    this.editable = false;
    this.complaintCategoryMappingList.data = [];
    this.categoryForm.resetForm();
  }

  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showList();
        }
      });
  }

  editCategoryMapping(complaintMappingValue: any) {
    console.log('complaintMappingValue', complaintMappingValue);
    this.editable = true;
    this.showTable = false;
    this.disableSelection = true;
    this.showListOfCategorymapping = false;
    this.editCategoryMappingValues = complaintMappingValue;
    this.oldCategoryID = complaintMappingValue.categoryID;
    this.getCategories(complaintMappingValue.providerServiceMapID);
  }

  updateCategoryMapping(formValue: any) {
    const updateReqObj = {
      oldCategoryID: this.oldCategoryID,
      categoryID: formValue.category.categoryID,
      categoryName: formValue.category.categoryName,
      feedbackNatureID: this.complaintType.feedbackNatureID,
      modifiedBy: this.createdBy,
    };
    this.complaintMappingService
      .updateComplaintCategoryMapping(updateReqObj)
      .subscribe((response: any) => {
        console.log('updated response', response.data);
        this.updateHandler(response.data);
      });
  }
  updateHandler(response: any) {
    this.alertService.alert('Updated successfully', 'success');
    this.editCategoryMappingValues = null;
    this.showList();
  }

  unmappingCategory(categoryID: any) {
    this.alertService
      .confirm('Confirm', 'Are you sure you want to Unmap ?')
      .subscribe((response: any) => {
        if (response) {
          const unmapObj = {
            categoryID: categoryID,
            modifiedBy: this.createdBy,
          };
          this.complaintMappingService
            .unmapCategory(unmapObj)
            .subscribe((response: any) => {
              this.alertService.alert('Unmapped Successfully');
              this.getComplaintTypeCategoryMapping(
                this.state.providerServiceMapID,
                this.complaintType.feedbackNatureID,
              );
            });
        }
      });
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredMappings.data = this.mappings;
    } else {
      this.filteredMappings.data = [];
      this.mappings.forEach((item: any) => {
        for (const key in item) {
          if (key === 'categoryName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredMappings.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}
