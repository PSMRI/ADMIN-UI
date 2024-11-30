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
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { EditCategorySubcategoryComponent } from './edit-category-subcategory/edit-category-subcategory.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CategorySubcategoryService } from 'src/app/app-provider-admin/provider-admin/activities/services/category-subcategory-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-category-subcategory-provisioning',
  templateUrl: './category-subcategory-provisioning.component.html',
  styleUrls: ['./category-subcategory-provisioning.component.css'],
})
export class CategorySubcategoryProvisioningComponent
  implements OnInit, AfterViewInit
{
  [x: string]: any;
  serviceList = new MatTableDataSource<any>();
  serviceSubCatList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) innerpaginator: MatPaginator | null = null;
  filteredsubCat = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;

  filtereddata = new MatTableDataSource<any>();

  // filteredsubCat: any = [];
  // filtereddata: any = [];
  serviceproviderID: any;
  well_being = false;
  showWellBeingFlag = false;

  selected_service_id: any;
  // ngmodels
  state: any;
  service: any;
  sub_service: any;
  showDiv = false;
  api_choice: any;
  subCat: any = [];
  // flags
  Add_Category_Subcategory_flag: boolean;
  showCategoryTable = true;
  showTable: boolean;
  searchChoice: any;
  states: any = [];
  serviceLines: any = [];
  subServices: any = [];
  // serviceList: any = [];
  request_object: any;
  providerServiceMapID!: number;
  categories: any = [];
  category_name: any;
  categorydesc: any;
  subcategory: any;
  description: any;
  filepath: any;
  data: any = [];
  searchForm = true;
  cateDisabled = 'false';
  createdBy: any;
  category_ID: any;
  // serviceSubCatList: any = [];
  sub_serviceID: any;
  hideButton = false;
  categoryExist = false;
  subCategoryExist = false;
  userID: any;
  nationalFlag!: boolean;
  displayedColumns: string[] = [
    'SNo',
    'Category',
    'CategoryDescription',
    'edit',
    'action',
  ];
  displayedColumnsTable2: string[] = [
    'SNo',
    'SubService',
    'Category',
    'CategoryDescription',
    'SubSubService',
    'edit',
  ];
  displayedColumnsTable3: string[] = [
    'SNo',
    'SubService',
    'Category',
    'subCategory',
    'SubCategoryDescription',
    'edit',
  ];
  displayedColumns4: string[] = [
    'SNo',
    'SubCategory',
    'SubCategoryDescription',
    'Category',
    'CategoryDescription',
    'edit',
    'action',
  ];

  @ViewChild('form')
  form!: NgForm;
  constructor(
    public commonDataService: dataService,
    public dialog: MatDialog,
    public CategorySubcategoryService: CategorySubcategoryService,
    private messageBox: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.api_choice = '0';
    this.searchChoice = '0';
    this.Add_Category_Subcategory_flag = true;
    this.showTable = true;
    this.serviceproviderID = this.sessionstorage.getItem('service_providerID');
    this.createdBy = this.commonDataService.uname;
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getServiceLines();
    this.cateDisabled = 'false';
    // if (this.boolFlag) {
    //   this.displayedColumns.splice(3, 0, 'SubSubService');
    // }
  }

  ngAfterViewInit() {
    this.filtereddata.paginator = this.paginatorFirst;
    this.filteredsubCat.paginator = this.paginatorSecond;
  }

  getServiceLines() {
    this.CategorySubcategoryService.getServiceLinesNew(this.userID).subscribe(
      (response: any) => {
        this.successhandeler(response);
      },
      (err: any) => {
        console.log('error', err);
        //  this.messageBox.alert(err, 'error')}
      },
    );
  }
  successhandeler(res: any) {
    this.serviceLines = res.data.filter(function (item: any) {
      if (
        item.serviceID === 3 ||
        item.serviceID === 1 ||
        item.serviceID === 6
      ) {
        return item;
      }
    });
    //         this.subServices = [];
    //    this.serviceLines = res
  }

  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.CategorySubcategoryService.getStatesNew(obj).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response, value),
      (err: any) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );
  }
  getStatesSuccessHandeler(response: any, value: any) {
    this.states = response.data;
    this.subServices = [];
    //this.sub_service = undefined;
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.getSubServices(value.isNational);
    } else {
      this.nationalFlag = value.isNational;
      //  this.getSubServices(value.isNational)
    }
  }

  getSubServices(value: any) {
    this.sub_service = undefined;
    if (value === 'get') {
      this.servicesGetting(this.state.providerServiceMapID);
    } else if (value === true) {
      this.servicesGetting(this.states[0].providerServiceMapID);
    } else {
      this.servicesGetting(this.state.providerServiceMapID);
    }
  }
  servicesGetting(proServiceMapID: any) {
    this.data = [];
    this.filtereddata.data = [];
    this.filtereddata.paginator = this.paginatorFirst;
    this.filteredsubCat.data = [];
    this.filteredsubCat.paginator = this.paginatorSecond;
    this.subCat = [];
    this.CategorySubcategoryService.getSubService(proServiceMapID).subscribe(
      (response: any) => {
        this.showWellBeingFlag = false;
        this.subServices = response.data;
        // if (this.selected_service_id === 1) {
        //   this.subServices = response.data.filter(function (item: any) {
        //     if (
        //       item.subServiceName !== null &&
        //       item.subServiceName !== undefined
        //     ) {
        //       return item;
        //     }
        //   });
        // } else if (this.selected_service_id === 3) {
        //   this.showWellBeingFlag = true;
        //   if (this.showWellBeingFlag) {
        //     this.displayedColumns.splice(3, 0, 'SubSubService');
        //   }
        //   this.subServices = response.data.filter(function (item: any) {
        //     if (
        //       item.subServiceName.toUpperCase() ===
        //         'Counselling Service'.toUpperCase() ||
        //       item.subServiceName.toUpperCase() ===
        //         'Psychiatrist'.toUpperCase() ||
        //       item.subServiceName.toUpperCase() ===
        //         'Service Improvements'.toUpperCase()
        //     ) {
        //       return item;
        //     }
        //   });
        // } else {
        //   this.subServices = response.data.filter(function (item: any) {
        //     if (
        //       item.subServiceName.toUpperCase() !==
        //       'Blood Request'.toUpperCase()
        //     ) {
        //       return item;
        //     }
        //   });
        // }

        console.log(this.subServices, 'The array after filter');
      },
      (err) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );
  }
  getCategory(providerserviceMapId: any, subServiceID: any) {
    this.providerServiceMapID = providerserviceMapId;
    this.sub_serviceID = subServiceID;
    this.CategorySubcategoryService.getCategory(
      providerserviceMapId,
      subServiceID,
    ).subscribe(
      (response: any) => {
        if (response) {
          this.categories = response.data.filter(function (item: any) {
            return item.deleted !== true;
          });
          this.data = response.data;
          this.filtereddata.data = response.data;
          this.filtereddata.paginator = this.paginatorFirst;
        }
      },
      (err) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );
  }
  getSubCategory(providerserviceMapId: any, subServiceID: any) {
    this.providerServiceMapID = providerserviceMapId;
    this.sub_serviceID = subServiceID;
    this.CategorySubcategoryService.getCategorybySubService(
      providerserviceMapId,
      subServiceID,
    ).subscribe(
      (response: any) => {
        if (response) {
          //  console.log(response, "subcat response");
          this.subCat = response.data.filter((obj: any) => {
            return obj !== null;
          });
          this.filteredsubCat.data = response.data.filter((obj: any) => {
            return obj !== null;
          });
        }
        this.filteredsubCat.paginator = this.paginatorSecond;
      },
      (err) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );
  }

  // searchReqObjChange(choice) {
  //   console.log(choice, "search choice");
  //   if (choice == 1) {
  //     this.showCategoryTable = false;
  //   }
  //   else {
  //     this.showCategoryTable = true;
  //   }
  // }
  searchReqObjChange(choice: any) {
    console.log(choice, 'search choice');
    if (this.nationalFlag !== undefined) {
      if (choice === '1') {
        this.showCategoryTable = false;
        if (this.nationalFlag) {
          this.getSubCategory(
            this.states[0].providerServiceMapID,
            this.sub_serviceID,
          );
        } else {
          this.getSubCategory(
            this.state.providerServiceMapID,
            this.sub_serviceID,
          );
        }
      } else {
        this.showCategoryTable = true;
        this.getCategory(this.state.providerServiceMapID, this.sub_serviceID);
      }
    }
  }
  callgetDetails(subService: any, providerServiceMap: any) {
    if (this.nationalFlag) {
      this.getDetails(subService);
    }
  }
  // to get the details of category and subcategory
  getDetails(subService: any) {
    this.showDiv = true;
    if (this.nationalFlag) {
      this.getCategory(
        this.states[0].providerServiceMapID,
        subService.subServiceID,
      );
      this.getSubCategory(
        this.states[0].providerServiceMapID,
        subService.subServiceID,
      );
    } else {
      this.getCategory(
        this.state.providerServiceMapID,
        subService.subServiceID,
      );
      this.getSubCategory(
        this.state.providerServiceMapID,
        subService.subServiceID,
      );
    }
  }

  addNew() {
    if (this.searchChoice === '0') {
      this.addNewCategoryRow();
    } else {
      this.addExistCategoryRow();
    }
    this.form.resetForm();
    this.well_being = false;
  }

  addNewCategoryRow() {
    const obj: any = {
      categoryName: this.category_name,
      categoryDesc: this.categorydesc,
      subServiceID: this.sub_service.subServiceID,
      subServiceName: this.sub_service.subServiceName,
      providerServiceMapID: this.nationalFlag
        ? this.states[0].providerServiceMapID
        : this.state.providerServiceMapID,
      createdBy: this.createdBy,
      well_being: this.well_being,
    };
    const isDuplicate = this.serviceList.data.some(
      (item) =>
        item.categoryName.trim().toLowerCase() ===
          obj.categoryName.trim().toLowerCase() &&
        item.subServiceID === obj.subServiceID,
    );
    if (!isDuplicate) {
      this.serviceList.data = [...this.serviceList.data, obj];
      this.category_name = undefined;
      this.categorydesc = '';
      this.well_being = false;
    } else {
      this.messageBox.alert(
        'Category already exists for the selected sub-service.',
      );
    }
  }

  checkSubService(service: any, sub_service_name: any) {
    console.log(service, sub_service_name, 'service and subservice name');
    if (
      (sub_service_name.toUpperCase() === 'Counselling Service'.toUpperCase() &&
        service === 3) ||
      (sub_service_name.toUpperCase() === 'Psychiatrist'.toUpperCase() &&
        service === 3)
    ) {
      this.showWellBeingFlag = true;
      if (this.showWellBeingFlag) {
        this.displayedColumns.splice(3, 0, 'SubSubService');
      }
      this.well_being = false;
    } else {
      this.showWellBeingFlag = false;
    }
  }

  addExistCategoryRow() {
    const obj: any = {};
    obj['subServiceID'] = this.sub_service.subServiceID;
    obj['subServiceName'] = this.sub_service.subServiceName;
    if (this.nationalFlag) {
      obj['providerServiceMapID'] = this.states[0].providerServiceMapID;
    } else {
      obj['providerServiceMapID'] = this.state.providerServiceMapID;
    }
    obj['categoryName'] = this.category_ID.categoryName;
    obj['categoryID'] = this.category_ID.categoryID;
    obj['subCategoryName'] = this.subcategory;
    obj['desc'] = this.description;
    obj['createdBy'] = this.createdBy;
    // if (this.serviceSubCatList.length > 0) {
    //   this.serviceSubCatList.push(obj);
    //   this.serviceSubCatList = this.filterSubCatArray(this.serviceSubCatList);
    // } else {
    //   this.serviceSubCatList.push(obj);
    // }
    let count = 0;
    for (let a = 0; a < this.serviceSubCatList.data.length; a++) {
      if (
        this.serviceSubCatList.data[a].subCategoryName !== undefined &&
        this.serviceSubCatList.data[a].subCategoryName !== null &&
        obj['subCategoryName'] !== undefined &&
        obj['subCategoryName'] !== null &&
        this.serviceSubCatList.data[a].categoryID === obj['categoryID'] &&
        this.serviceSubCatList.data[a].subCategoryName.toLowerCase().trim() ===
          obj['subCategoryName'].toLowerCase().trim() &&
        this.serviceSubCatList.data[a].subServiceID === obj['subServiceID']
      ) {
        count = count + 1;
      }
      // this.serviceList.push(obj);
      // this.serviceList = this.filterArray(this.serviceList);
    }
    if (count === 0) {
      this.serviceSubCatList.data.push(obj);
    } else {
      this.messageBox.alert('Already exists');
    }
    this.subcategory = undefined;
    this.description = '';
  }

  // add category
  addNewCategory() {
    let categoryObj = [];
    categoryObj = this.serviceList.data.map(function (item: any) {
      return {
        categoryName: item.categoryName,
        categoryDesc: item.categoryDesc,
        subServiceID: item.subServiceID,
        providerServiceMapID: item.providerServiceMapID,
        s104_CS_Type: item.well_being,
        createdBy: item.createdBy,
      };
    });

    this.CategorySubcategoryService.saveCategory(categoryObj).subscribe(
      (response: any) => {
        if (response) {
          if (response.data.length > 0) {
            this.messageBox.alert('Saved successfully', 'success');
            this.serviceList.data = [];
            if (this.nationalFlag) {
              this.getCategory(
                this.states[0].providerServiceMapID,
                this.sub_service.subServiceID,
              );
            } else {
              this.getCategory(
                this.state.providerServiceMapID,
                this.sub_service.subServiceID,
              );
            }
          }
        }
      },
      (err) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );
  }

  // add sub category
  addSubCategory() {
    let subCategoryObj = [];
    subCategoryObj = this.serviceSubCatList.data.map(function (item: any) {
      return {
        subCategoryName: item.subCategoryName,
        subCategoryDesc: item.desc,
        categoryID: item.categoryID,
        providerServiceMapID: item.providerServiceMapID,
        subServiceID: item.subServiceID,
        createdBy: item.createdBy,
      };
    });

    this.CategorySubcategoryService.saveSubCategory(subCategoryObj).subscribe(
      (response: any) => {
        if (response.data.length > 0) {
          this.messageBox.alert('Saved successfully', 'success');
          this.serviceSubCatList.data = [];
          if (this.nationalFlag) {
            this.getSubCategory(
              this.states[0].providerServiceMapID,
              this.sub_service.subServiceID,
            );
          } else {
            this.getSubCategory(
              this.state.providerServiceMapID,
              this.sub_service.subServiceID,
            );
          }
          //  this.getDetails(this.sub_service, providerServiceMapID);
        }
      },
      (err) => {},
    );
  }

  editCategory(catObj: any) {
    const categoryObj: any = {};
    categoryObj['categoryID'] = catObj.categoryID;
    categoryObj['categoryName'] = catObj.categoryName;
    categoryObj['subService'] = this.sub_service.subServiceName;
    categoryObj['providerServiceMapId'] = catObj.providerServiceMapID;
    categoryObj['categoryDesc'] = catObj.categoryDesc;

    const object = {
      categoryObj: categoryObj,
      isCategory: true,
      isSubCategory: false,
      categories: this.categories,
      subcategories: this.subCat,
    };
    const dialogReff = this.dialog.open(EditCategorySubcategoryComponent, {
      height: '350px',
      width: '500px',
      disableClose: true,
      data: object,
    });
    dialogReff.componentInstance.categoryType = true;
    dialogReff.afterClosed().subscribe((res) => {
      if (res) {
        this.getCategory(catObj.providerServiceMapID, catObj.subServiceID);
      }
    });
  }

  editSubCategory(subCatObj: any) {
    const categoryObj: any = {};
    categoryObj['categoryID'] = subCatObj.categoryID;
    categoryObj['categoryName'] = subCatObj.categoryName;
    categoryObj['subService'] = this.sub_service.subServiceName;
    categoryObj['providerServiceMapId'] = subCatObj.providerServiceMapID;
    // categoryObj['categoryDesc'] = subCatObj.categoryDesc;
    categoryObj['subCategoryID'] = subCatObj.subCategoryID;
    categoryObj['subCategoryName'] = subCatObj.subCategoryName;
    categoryObj['subCategoryDesc'] = subCatObj.subCategoryDesc;

    const object = {
      categoryObj: categoryObj,
      isCategory: false,
      isSubCategory: true,
      categories: this.categories,
      subcategories: this.subCat,
    };

    const dialogReff = this.dialog.open(EditCategorySubcategoryComponent, {
      height: '400px',
      width: '500px',
      disableClose: true,
      data: object,
    });
    dialogReff.componentInstance.subCategoryType = true;
    dialogReff.afterClosed().subscribe((res) => {
      if (res) {
        this.getSubCategory(
          subCatObj.providerServiceMapID,
          subCatObj.subServiceID,
        );
      }
    });
    // console.log(subCatObj);
  }

  deleteRow(index: any) {
    const newData = [...this.serviceList.data];
    newData.splice(index, 1);
    this.serviceList.data = newData;
    this.cdr.detectChanges();
    if (this.serviceList.data.length === 0) {
      this.cateDisabled = 'false';
      this.category_name = '';
      this.categorydesc = '';
    }
  }

  deleteRowSubCat(index: any) {
    const newData = [...this.serviceSubCatList.data];
    newData.splice(index, 1);
    this.serviceSubCatList.data = newData;
    this.cdr.detectChanges();
  }
  deleteCategory(id: any, isActivate: boolean) {
    let confirmMessage: any;
    if (isActivate) {
      confirmMessage = 'Deactivate';
    } else {
      confirmMessage = 'Activate';
    }
    this.messageBox
      .confirm('confirm', 'Are you sure want to ' + confirmMessage + '?')
      .subscribe(
        (res) => {
          if (res) {
            this.CategorySubcategoryService.deleteCategory(
              id,
              isActivate,
            ).subscribe(
              (response: any) => {
                if (response) {
                  this.messageBox.alert(
                    confirmMessage + 'd successfully',
                    'success',
                  );
                  this.refeshCategory(
                    response.data.subServiceID,
                    response.data.providerServiceMapID,
                  );
                }
              },
              (err) => {},
            );
          }
        },
        (err) => {},
      );
  }

  deleteSubCategory(id: any, flag: any, catgexist: any) {
    if (catgexist) {
      this.messageBox.alert('Category is inactive');
    } else {
      let confirmMessage: any;
      if (flag) {
        confirmMessage = 'Deactivate';
      } else {
        confirmMessage = 'Activate';
      }
      this.messageBox
        .confirm('confirm', 'Are you sure want to ' + confirmMessage + '?')
        .subscribe(
          (res) => {
            if (res) {
              this.CategorySubcategoryService.deleteSubCategory(
                id,
                flag,
              ).subscribe(
                (response) => {
                  if (response) {
                    // console.log(response,"after delete");
                    this.messageBox.alert(
                      confirmMessage + 'd successfully',
                      'success',
                    );
                    this.refeshCategory(
                      this.sub_serviceID,
                      this.providerServiceMapID,
                    );
                  }
                },
                (err) => {},
              );
            }
          },
          (err) => {},
        );
    }
  }

  // to refresh the category after deletion
  refeshCategory(subService: any, providerServiceMap: any) {
    this.showDiv = true;
    this.CategorySubcategoryService.getCategory(
      providerServiceMap,
      subService,
    ).subscribe(
      (response: any) => {
        if (response) {
          this.data = response.data.filter(function (item: any) {
            return item.categoryID !== null && item.categoryName !== null;
          });
          this.filtereddata.data = response.data.filter(function (item: any) {
            return item.categoryID !== null && item.categoryName !== null;
          });
          this.categories = response.data.filter(function (item: any) {
            return item.deleted !== true;
          });
        }
        this.filtereddata.paginator = this.paginatorFirst;
      },
      (err) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );

    this.CategorySubcategoryService.getCategorybySubService(
      providerServiceMap,
      subService,
    ).subscribe(
      (response: any) => {
        if (response) {
          console.log(response, 'subCategory');
          this.subCat = response.data.filter(function (item: any) {
            return item !== null;
          });
          this.filteredsubCat.data = response.data.filter(function (item: any) {
            return item !== null;
          });
          console.log(this.subCat);
        }
        this.filteredsubCat.paginator = this.paginatorSecond;
      },
      (err) => {
        console.log('error', err);
        // this.messageBox.alert(err, 'error')
      },
    );
  }

  changeRequestObject(flag_value: any) {
    if (flag_value === '0') {
      this.Add_Category_Subcategory_flag = true;

      /*edited by diamond*/
      this.categoryExist = false;
      this.subCategoryExist = false;

      this.category_name = '';
      this.categorydesc = '';

      this.subcategory = '';
      this.description = '';

      this.well_being = false;
      /*editing ends*/

      // this.resetFields();
    }
    if (flag_value === '1') {
      this.Add_Category_Subcategory_flag = false;
      if (this.nationalFlag) {
        this.getCategory(
          this.states[0].providerServiceMapID,
          this.sub_service.subServiceID,
        );
      } else {
        this.getCategory(
          this.state.providerServiceMapID,
          this.sub_service.subServiceID,
        );
      }
      // this.resetFields();

      /*edited by diamond*/
      this.categoryExist = false;
      this.subCategoryExist = false;

      this.category_name = '';
      this.categorydesc = '';

      this.subcategory = '';
      this.description = '';
      /*editing ends*/
    }
  }
  // final save to save category and sub category
  finalsave() {
    if (this.searchChoice === '0') {
      this.addNewCategory();
    } else {
      this.addSubCategory();
    }
    this.searchForm = true;
    this.serviceList.data.length = 0;
    this.serviceSubCatList.data = [];
    this.showTable = true;
    this.cateDisabled = 'false';
    if (this.nationalFlag) {
      this.getCategory(
        this.states[0].providerServiceMapID,
        this.sub_service.subServiceID,
      );
      this.getSubCategory(
        this.states[0].providerServiceMapID,
        this.sub_service.subServiceID,
      );
      // this.getDetails(this.sub_service);
    } else {
      this.getCategory(
        this.state.providerServiceMapID,
        this.sub_service.subServiceID,
      );
      this.getSubCategory(
        this.state.providerServiceMapID,
        this.sub_service.subServiceID,
      );
      //  this.getDetails(this.sub_service);
    }
  }
  hideTable() {
    this.showTable = false;
    this.searchForm = false;
    this.changeRequestObject(this.searchChoice);
  }

  hideForm() {
    this.showTable = true;
  }

  back() {
    this.messageBox
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.searchForm = true;
          this.serviceList.data.length = 0;
          this.serviceSubCatList.data = [];
          this.showTable = true;
          this.cateDisabled = 'false';
          if (this.nationalFlag) {
            this.getCategory(
              this.states[0].providerServiceMapID,
              this.sub_service.subServiceID,
            );
            this.getSubCategory(
              this.states[0].providerServiceMapID,
              this.sub_service.subServiceID,
            );
          } else {
            this.getCategory(
              this.state.providerServiceMapID,
              this.sub_service.subServiceID,
            );
            this.getSubCategory(
              this.state.providerServiceMapID,
              this.sub_service.subServiceID,
            );
          }
        }
      });
  }

  filterTable(response: any) {
    this.data = this.data.filter(function (item: any) {
      return (
        item.subCategoryID !== response.subCategoryID &&
        item.categoryID !== response.categoryID
      );
    });
  }
  resetFields() {
    this.state = '';
    this.service = '';
    this.sub_service = '';
    this.category_name = '';
    this.categorydesc = '';
    this.subcategory = '';
    this.description = '';
    this.filepath = '';
    this.category_ID = '';
    this.cateDisabled = 'false';
  }
  filterArray(array: any) {
    const o = {};
    return (array = array.filter(
      (thing: any, index: any, self: any) =>
        self.findIndex((t: any) => {
          return (
            t.categoryName.toLowerCase().trim() ===
              thing.categoryName.toLowerCase().trim() &&
            t.subServiceID === thing.subServiceID
          );
        }) === index,
    ));
  }

  filterSubCatArray(array: any) {
    const o = {};
    return (array = array.filter(
      (thing: any, index: any, self: any) =>
        self.findIndex((t: any) => {
          return (
            t.categoryID === thing.categoryID &&
            t.subCategoryName.toLowerCase().trim() ===
              thing.subCategoryName.toLowerCase().trim() &&
            t.subServiceID === thing.subServiceID
          );
        }) === index,
    ));
  }

  checkCategory(event: any) {
    const categoryName = event.target.value;
    let categoriesExist;
    if (categoryName && categoryName !== '') {
      console.log(categoryName, 'categoryName here');
      console.log('categories', this.categories);

      categoriesExist = this.categories.filter(function (item: any) {
        return (
          item.categoryName.toString().toLowerCase().trim() ===
          categoryName.toString().toLowerCase().trim()
        );
      });
    }
    console.log('category', this.categoryExist, 'ca5tegories', categoriesExist);

    if (categoriesExist !== undefined && categoriesExist.length > 0) {
      this.categoryExist = true;
    } else if (categoryName.trim().length === 0) {
      this.categoryExist = false;
    } else {
      this.categoryExist = false;
    }
  }
  checkSubCategory(
    subCategoryName: string,
    providerServiceMapId: any,
    subService: any,
    category: any,
  ) {
    if (subCategoryName && subService && category) {
      let subCategoriesExist;
      let pServiceMapID;
      if (this.nationalFlag) {
        pServiceMapID = this.states[0].providerServiceMapID;
      } else {
        pServiceMapID = this.state.providerServiceMapID;
      }
      this.CategorySubcategoryService.getCategorybySubService(
        pServiceMapID,
        subService.subServiceID,
      ).subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'subcat response');
            subCategoriesExist = response.data.filter((value: any) => {
              if (value) {
                value.categoryID === category.categoryID &&
                  value.subCategoryName.toString().toLowerCase().trim() ===
                    subCategoryName.toString().toLowerCase().trim();
              }
            });
            if (
              subCategoriesExist !== undefined &&
              subCategoriesExist.length > 0
            ) {
              this.subCategoryExist = true;
            } else if (
              subCategoryName !== undefined &&
              subCategoryName !== null &&
              subCategoryName.trim().length === 0
            ) {
              this.categoryExist = true;
            } else {
              this.subCategoryExist = false;
            }
          }
        },
        (err) => {
          console.log('error', err);
          // this.messageBox.alert(err, 'error')
        },
      );
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filtereddata.data = this.data;
      this.filtereddata.paginator = this.paginatorFirst;
    } else {
      this.filtereddata.data = [];
      this.filtereddata.paginator = this.paginatorFirst;
      this.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'callGroupType' || key === 'callType') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filtereddata.data.push(item);
              break;
            }
            this.filtereddata.paginator = this.paginatorFirst;
          }
        }
      });
    }
  }
  filterComponentListSub(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsubCat.data = this.subCat;
      this.filteredsubCat.paginator = this.paginatorSecond;
    } else {
      this.filteredsubCat.data = [];
      this.subCat.forEach((item: any) => {
        for (const key in item) {
          const value: string = '' + item[key];
          if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
            this.filteredsubCat.data.push(item);
            break;
          }
          this.filteredsubCat.paginator = this.paginatorSecond;
        }
      });
    }
  }
}
