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
  AfterViewInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ItemService } from '../services/item.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SnomedCodeSearchComponent } from '../../configurations/snomed-code-search/snomed-code-search.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-item-master',
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.css'],
})
export class ItemMasterComponent implements OnInit {
  filteredItemList = new MatTableDataSource<any>();
  itemArrayObj = new MatTableDataSource<any>();
  // @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  providerServiceMapID: any;
  providerID: any;
  userID: any;
  state: any;
  service: any;
  bool: any;
  discontinue!: boolean;
  createdBy: any;
  confirmMessage: any;
  discontinueMessage: any;
  itemCodeExist: any;
  editMode = false;
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  tableMode = true;
  create_filterTerm!: string;

  /*Arrays*/
  services: any = [];
  states: any = [];
  itemsList: any = [];
  // filteredItemList: any = [];
  categories: any = [];
  edit_categories: any = [];
  discontinueresult: any = [];
  dosages: any = [];
  edit_dosages: any = [];
  pharmacologies: any = [];
  edit_pharmacologies: any = [];
  manufacturers: any = [];
  edit_Manufacturerlist: any = [];
  measures: any = [];
  edit_measures: any = [];
  routes: any = [];
  edit_routes: any = [];
  // itemArrayObj: any = [];
  availableItemCodeInList: any = [];
  edit_serviceline: any;
  edit_state: any;
  edit_ItemType: any;
  edit_Code: any;
  edit_Name: any;
  edit_Category: any;
  edit_Dose: any;
  edit_Pharmacology: any;
  edit_Manufacturer: any;
  edit_Strength: any;
  edit_Uom: any;
  edit_DrugType: any;
  edit_Composition: any;
  edit_Route: any;
  edit_Description: any;
  itemID: any;
  drugTypeList: any = ['Non-EDL', 'EDL'];
  drugType = false;
  drugName: any = 'EDL';
  isEDL = false;
  @ViewChild('searchForm')
  searchForm!: NgForm;
  @ViewChild('itemCreationForm')
  itemCreationForm!: NgForm;
  EDL: any = [];
  code: any;
  name: any;
  composition: any;
  description: any;
  route: any;
  strength: any;
  uom: any;
  itemType: any;
  category: any;
  dose: any;
  manufacturer: any;
  pharmacology: any;
  editDrug!: string;
  testsnomedCode: any;
  snomedFlag = false;
  enableAlert = true;
  testSnomedName: any;
  editSnomedCode: any;
  editSnomedName: any;
  snomedEditFlag = false;
  disableSnomedCode = false;
  serviceline: any;
  // displayedColumns: string[] = [
  //   'sno',
  //   'isMedical',
  //   'itemCode',
  //   'itemName',
  //   'itemCategory',
  //   'isEDL',
  //   'edit',
  //   'discontinued',
  //   'action'
  // ];
  paginator!: MatPaginator;
  @ViewChild('paginatorMain') set mainPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.filteredItemList.paginator = this.paginator;
  }

  paginatorAddItems!: MatPaginator;
  @ViewChild('paginatorSub') set subPaginator(mp: MatPaginator) {
    this.paginatorAddItems = mp;
    this.setDataSourceAttributesForItems();
  }
  setDataSourceAttributesForItems() {
    this.itemArrayObj.paginator = this.paginatorAddItems;
  }

  constructor(
    public commonDataService: dataService,
    public itemService: ItemService,
    public commonServices: CommonServices,
    public dialogService: ConfirmationDialogsService,
    public dialog: MatDialog,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.providerID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    // debugger;
    this.createdBy = this.commonDataService.uname;
    console.log('this.createdBy', this.createdBy);

    this.userID = this.commonDataService.uid;
    console.log('userID', this.userID);
    this.getAllServices();
    this.drugName = 'EDL';
  }
  // ngAfterViewInit() {
  //   this.filteredItemList.paginator = this.paginator;
  // }
  getAllServices() {
    // debugger;
    this.commonServices
      .getServiceLines(this.userID)
      .subscribe((response: any) => {
        console.log('serviceline', response);
        this.servicesSuccesshandler(response),
          (err: any) => console.log('ERROR in fetching serviceline');
      });
  }
  servicesSuccesshandler(res: any) {
    this.services = res.data.filter(function (item: any) {
      console.log('item', item);
      if (item.serviceID === 4 || item.serviceID === 9 || item.serviceID === 2)
        return item;
    });
  }
  drugTypeChange(item: any) {
    if (item === 'EDL') {
      this.isEDL = true;
      this.drugName = 'EDL';
    } else {
      this.isEDL = false;
      this.drugName = 'Non-EDL';
    }
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    console.log('psmid', this.providerServiceMapID);
    this.getAllItemsList(providerServiceMapID);
    this.getCategoriesList(this.providerServiceMapID);
    this.getDosageList(this.providerServiceMapID);
    this.pharmacologiesList(this.providerServiceMapID);
    this.manufacturerList(this.providerServiceMapID);
    this.unitOfMeasuresList(this.providerServiceMapID);
    this.routeAdminList(this.providerServiceMapID);
  }

  getStates(service: any) {
    // debugger;
    console.log('value', service);
    this.commonServices
      .getStatesOnServices(this.userID, service.serviceID, false)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, service),
        (err) => {
          console.log('error in fetching states');
        },
      );
  }
  getStatesSuccessHandeler(response: any, service: any) {
    this.states = response.data;
  }

  getAllItemsList(providerServiceMapID: any) {
    console.log('providerServicemapID', this.providerServiceMapID);

    this.itemService.getAllItems(this.providerServiceMapID).subscribe(
      (itemListResponse: any) => this.itemsSuccessHandler(itemListResponse),
      (err) => {
        console.log('Error Items not found', err);
      },
    );
  }

  itemsSuccessHandler(itemListResponse: any) {
    console.log('All items', itemListResponse.data);
    this.itemsList = itemListResponse.data;
    console.log('itemListResponse.data', itemListResponse.data);
    this.filteredItemList.data = itemListResponse.data;
    console.log('this.filteredItemList.data', this.filteredItemList.data);
    this.filteredItemList.paginator = this.paginator;
    this.showTableFlag = true;
    //this.disableEDL=true;
    for (const availableItemCode of this.itemsList) {
      console.log('edl');
      console.log(availableItemCode);
      this.availableItemCodeInList.push(availableItemCode.itemCode);
    }
  }
  showForm() {
    this.tableMode = false;
    this.showTableFlag = false;
    this.showFormFlag = true;
    this.disableSelection = true;
  }
  filterItemFromList(searchTerm?: string) {
    // debugger;
    if (!searchTerm) {
      this.filteredItemList.data = this.itemsList;
      this.filteredItemList.paginator = this.paginator;
    } else {
      this.filteredItemList.data = [];
      this.itemsList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'itemCode' || key === 'itemName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredItemList.data.push(item);
              console.log(
                'this.filteredItemList.data',
                this.filteredItemList.data,
              );
              break;
            }
          } else if (key === 'itemCategory') {
            const value: string = '' + item[key]['itemCategoryName'];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredItemList.data.push(item);
              console.log(
                'this.filteredItemList.data',
                this.filteredItemList.data,
              );
              break;
            }
          }
        }
      });
      this.filteredItemList.paginator = this.paginator;
    }
  }

  setDiscontinue(itemID: any, discontinue: any) {
    // debugger;
    if (discontinue) {
      this.discontinueMessage = 'Item discontinued';
    } else {
      this.discontinueMessage = 'Item continued';
    }
    this.itemService
      .setDiscontinue(itemID, discontinue)
      .subscribe((discontinueResponse: any) => {
        this.discontinueSuccesshandler(
          discontinueResponse,
          this.discontinueMessage,
        ),
          (err: any) => console.log('ERROR in setDiscontinue');
      });
    console.log('value', discontinue, itemID);
  }
  discontinueSuccesshandler(discontinueResponse: any, discontinueMessage: any) {
    this.discontinueresult = discontinueResponse.data;
    this.create_filterTerm = '';
    this.dialogService.alert(discontinueMessage, 'success');
    console.log('discontinue List', this.discontinueresult);
  }
  checkCodeExistance(code: any) {
    // console.log(code);
    // this.itemCodeExist = this.availableItemCodeInList.includes(code);
    this.itemService
      .confirmItemCodeUnique(code, 'itemmaster', this.providerServiceMapID)
      .subscribe((res: any) => {
        if (res && res.statusCode === 200 && res.data) {
          console.log(res);
          console.log(res.data);
          console.log(res.data.response);
          // this.itemCodeExist = res.data.response;
          this.localCodeExists(code, res.data.response);
        }
      });
  }

  localCodeExists(code: any, returned: any) {
    let duplicateStatus = 0;
    if (this.itemArrayObj.data.length > 0) {
      for (let i = 0; i < this.itemArrayObj.data.length; i++) {
        if (this.itemArrayObj.data[i].itemCode === code) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
    }
    if (duplicateStatus > 0 || returned === 'true') {
      this.itemCodeExist = true;
    } else {
      this.itemCodeExist = false;
    }
  }
  getCategoriesList(providerServiceMapID: any) {
    this.itemService
      .getAllItemsCategory(this.providerServiceMapID, 0)
      .subscribe((categoryResponse: any) => {
        this.categoriesSuccesshandler(categoryResponse),
          (err: any) => console.log('ERROR in fetching category list');
      });
  }
  categoriesSuccesshandler(categoryResponse: any) {
    this.edit_categories = categoryResponse.data;
    this.categories = categoryResponse.data.filter(
      (category: any) => category.deleted !== true,
    );
    console.log('categories List', this.categories);
  }
  getDosageList(providerServiceMapID: any) {
    this.itemService
      .getAllDosages(this.providerServiceMapID)
      .subscribe((dosageResponse: any) => {
        this.dosageSuccesshandler(dosageResponse),
          (err: any) => console.log('ERROR in fetching dosage list');
      });
  }
  dosageSuccesshandler(dosageResponse: any) {
    this.edit_dosages = dosageResponse.data;
    this.dosages = dosageResponse.data.filter(
      (dose: any) => dose.deleted !== true,
    );
    console.log('dosage list', this.dosages);
  }
  pharmacologiesList(providerServiceMapID: any) {
    console.log('check inside pharma');

    this.itemService
      .getAllPharmacologyCategory(this.providerServiceMapID)
      .subscribe((pharmacologyResponse: any) => {
        console.log('pharmacologyResponse', pharmacologyResponse);

        this.pharmacologySuccesshandler(pharmacologyResponse),
          (err: any) => console.log('ERROR in fetching pharmacological list');
      });
  }
  pharmacologySuccesshandler(pharmacologyResponse: any) {
    // debugger;
    this.edit_pharmacologies = pharmacologyResponse.data;
    this.pharmacologies = pharmacologyResponse.data.filter(
      (pharmacology: any) => pharmacology.deleted !== true,
    );
    console.log('pharmacology', this.pharmacologies);
  }
  manufacturerList(providerServiceMapID: any) {
    console.log('check inside manufacturer');

    this.itemService
      .getAllManufacturers(this.providerServiceMapID)
      .subscribe((manufacturerResponse: any) => {
        console.log('manufacturerResponse', manufacturerResponse);

        this.manufacturerSuccesshandler(manufacturerResponse),
          (err: any) => console.log('ERROR in fetching manufacturer list');
      });
  }
  manufacturerSuccesshandler(manufacturerResponse: any) {
    this.edit_Manufacturerlist = manufacturerResponse.data;
    this.manufacturers = manufacturerResponse.data.filter(
      (manufacture: any) => manufacture.deleted !== true,
    );
    console.log('manufacturers', this.manufacturers);
  }
  unitOfMeasuresList(providerServiceMapID: any) {
    // debugger;
    console.log('check inside Uom');
    this.itemService
      .getAllUoms(this.providerServiceMapID)
      .subscribe((uomResponse: any) => {
        console.log('uomResponse', uomResponse);

        this.uomSuccesshandler(uomResponse),
          (err: any) => console.log('ERROR in fetching Uom list');
      });
  }
  uomSuccesshandler(uomResponse: any) {
    this.edit_measures = uomResponse.data;
    this.measures = uomResponse.data.filter((uom: any) => uom.deleted !== true);
    console.log('measures', this.measures);
  }
  routeAdminList(providerServiceMapID: any) {
    console.log('check inside route');
    this.itemService
      .getAllRoutes(this.providerServiceMapID)
      .subscribe((routeResponse: any) => {
        console.log('routeResponse', routeResponse);
        this.routeSuccesshandler(routeResponse),
          (err: any) => console.log('ERROR in fetching route list');
      });
  }
  routeSuccesshandler(routeResponse: any) {
    this.edit_routes = routeResponse.data;
    this.routes = routeResponse.data.filter(
      (route: any) => route.deleted !== true,
    );
    console.log('routes', this.routes);
  }
  resetAllForms() {
    this.searchForm.resetForm();
    this.itemCreationForm.resetForm();
    this.drugName = 'EDL';
  }
  resetItemCreationForm() {
    this.itemCreationForm.controls['description'].reset();
    this.itemCreationForm.controls['itemType'].reset();
    this.itemCreationForm.controls['code'].reset();
    this.itemCreationForm.controls['name'].reset();
    this.itemCreationForm.controls['testsnomedCode'].reset();
    this.itemCreationForm.controls['testSnomedName'].reset();
    this.itemCreationForm.controls['strength'].reset();
    this.itemCreationForm.controls['uom'].reset();
    this.itemCreationForm.controls['category'].reset();
    this.itemCreationForm.controls['dose'].reset();
    this.itemCreationForm.controls['pharmacology'].reset();
    this.itemCreationForm.controls['manufacturer'].reset();
    this.itemCreationForm.controls['drugType'].reset();
    this.itemCreationForm.controls['composition'].reset();
    this.itemCreationForm.controls['route'].reset();
    this.itemCreationForm.controls['description'].reset();
    this.drugType = false;
    this.drugName = 'EDL';
    this.itemCreationForm.controls['drugType'].patchValue(false);
    this.enableAlert = true;
    this.snomedFlag = false;
    this.itemCreationForm.controls['testsnomedCode'].enable();
    this.testsnomedCode = null;
    this.testSnomedName = null;
  }
  addMultipleItemArray(formValue: any) {
    if (this.enableAlert === true) {
      this.dialogService
        .confirm(
          'Confirm',
          'No SNOMED CT Code selected for the Item, Do you want to proceed?',
        )
        .subscribe((response) => {
          if (response) {
            this.testsnomedCode = null;
            this.testSnomedName = null;
            console.log('formValue', formValue);

            // debugger;
            const multipleItem = {
              // "serviceName": this.service.serviceName,
              // "stateName": this.state.stateName,
              isMedical: formValue.itemType,
              itemCode: formValue.code,
              itemName:
                formValue.name !== undefined && formValue.name !== null
                  ? formValue.name.trim()
                  : null,
              sctCode: this.testsnomedCode,
              sctTerm: this.testSnomedName,
              itemDesc: formValue.description,
              itemCategoryID: formValue.category?.itemCategoryID,
              itemFormID: formValue.dose?.itemFormID,
              pharmacologyCategoryID:
                formValue.pharmacology !== null
                  ? formValue.pharmacology?.pharmacologyCategoryID
                  : null,
              manufacturerID:
                formValue.manufacturer !== null
                  ? formValue.manufacturer?.manufacturerID
                  : null,
              strength: formValue.strength,
              uomID: formValue.uom.uOMID,
              isScheduledDrug: formValue.drugType,
              composition: formValue.composition,
              routeID: formValue.route.routeID,
              createdBy: this.createdBy,
              providerServiceMapID: this.providerServiceMapID,
              status: 'active',
              isEDL: formValue.drugName === 'Non-EDL' ? false : true,
            };
            console.log('multipleItem', multipleItem);
            this.checkDuplicates(multipleItem);
            this.resetItemCreationForm();
            formValue.drugName = 'EDL';
            formValue.drugType = false;
            this.drugName = 'EDL';
            this.drugType = false;
          }
        });
    } else {
      console.log('formValue', formValue);

      // debugger;
      const multipleItem = {
        // "serviceName": this.service.serviceName,
        // "stateName": this.state.stateName,
        isMedical: formValue.itemType,
        itemCode: formValue.code,
        itemName:
          formValue.name !== undefined && formValue.name !== null
            ? formValue.name.trim()
            : null,
        sctCode: this.testsnomedCode,
        sctTerm: this.testSnomedName,
        itemDesc: formValue.description,
        itemCategoryID: formValue.category?.itemCategoryID,
        itemFormID: formValue.dose.itemFormID,
        pharmacologyCategoryID:
          formValue.pharmacology !== null
            ? formValue.pharmacology?.pharmacologyCategoryID
            : null,
        manufacturerID:
          formValue.manufacturer !== null
            ? formValue.manufacturer?.manufacturerID
            : null,
        strength: formValue.strength,
        uomID: formValue.uom.uOMID,
        isScheduledDrug: formValue.drugType,
        composition: formValue.composition,
        routeID: formValue.route.routeID,
        createdBy: this.createdBy,
        providerServiceMapID: this.providerServiceMapID,
        status: 'active',
        isEDL: formValue.drugName === 'Non-EDL' ? false : true,
      };
      console.log('multipleItem', multipleItem);
      this.checkDuplicates(multipleItem);
      this.resetItemCreationForm();
      formValue.drugName = 'EDL';
      formValue.drugType = false;
      this.drugName = 'EDL';
      this.drugType = false;
    }
  }

  checkDuplicates(multipleItem: any) {
    let duplicateStatus = 0;
    if (this.itemArrayObj.data.length === 0) {
      this.itemArrayObj.data.push(multipleItem);
      this.itemArrayObj.paginator = this.paginatorAddItems;
    } else {
      for (let i = 0; i < this.itemArrayObj.data.length; i++) {
        if (this.itemArrayObj.data[i].itemCode === multipleItem.itemCode) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        this.itemArrayObj.data.push(multipleItem);
        this.itemArrayObj.paginator = this.paginatorAddItems;
      }
    }
  }
  removeRow(index: any) {
    this.itemArrayObj.data.splice(index, 1);
    this.itemArrayObj.paginator = this.paginatorAddItems;
  }
  showTable() {
    this.showTableFlag = true;
    this.showFormFlag = false;
    this.tableMode = true;
    this.editMode = false;
  }
  saveItem() {
    this.itemService.createItem(this.itemArrayObj.data).subscribe(
      (response) => {
        if (response) {
          console.log(response, 'item created');
          this.resetItemCreationForm();
          this.itemArrayObj.data = [];
          this.itemArrayObj.paginator = this.paginatorAddItems;
          this.dialogService.alert('Saved Successfully', 'success');
          this.showTable();

          this.getAllItemsList(this.providerServiceMapID);
          this.drugName = 'EDL';
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  back() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.itemArrayObj.data = [];
          this.itemArrayObj.paginator = this.paginatorAddItems;
          this.tableMode = true;
          this.editMode = false;
          this.showTableFlag = true;
          this.showFormFlag = false;
          this.disableSelection = false;
          this.getAllItemsList(this.providerServiceMapID);
          this.create_filterTerm = '';
        }
      });
  }
  editItem(itemlist: any) {
    console.log('Existing Data', itemlist);
    this.itemID = itemlist.itemID;
    this.edit_serviceline = this.service;
    this.edit_state = this.state;
    this.edit_ItemType = itemlist.isMedical;
    this.edit_Code = itemlist.itemCode;
    this.edit_Name = itemlist.itemName;
    this.editSnomedCode = itemlist.sctCode;
    this.editSnomedName = itemlist.sctTerm;
    if (
      itemlist.sctCode === null ||
      itemlist.sctCode === undefined ||
      itemlist.sctCode === ''
    ) {
      this.disableSnomedCode = false;
      this.snomedEditFlag = false;
      this.enableAlert = true;
    } else {
      this.disableSnomedCode = true;
      this.snomedEditFlag = true;
      this.enableAlert = false;
    }

    this.edit_Category = itemlist.itemCategoryID;
    this.edit_Dose = itemlist.itemFormID;
    this.edit_Pharmacology = itemlist.pharmacologyCategoryID;
    this.edit_Manufacturer = itemlist.manufacturerID;
    this.edit_Strength = itemlist.strength;
    this.edit_Uom = itemlist.uomID;
    this.edit_DrugType = itemlist.isScheduledDrug;
    this.edit_Composition = itemlist.composition;
    this.edit_Route = itemlist.routeID;
    this.edit_Description = itemlist.itemDesc;
    if (itemlist.isEDL === true) this.editDrug = 'EDL';
    else this.editDrug = 'Non-EDL';
    this.showEditForm();
  }
  showEditForm() {
    this.tableMode = false;
    this.showFormFlag = false;
    this.editMode = true;
  }

  updateItem(editItemCreationForm: any) {
    if (this.enableAlert === true) {
      this.dialogService
        .confirm(
          'Confirm',
          'No SNOMED CT Code selected for the Item, Do you want to proceed?',
        )
        .subscribe((response) => {
          if (response) {
            this.editSnomedCode = null;
            this.editSnomedName = null;
            this.update(editItemCreationForm);
          }
        });
    } else {
      this.update(editItemCreationForm);
    }
  }
  update(editItemCreationForm: any) {
    // debugger;
    const updateItemObject: any = {
      itemDesc: editItemCreationForm.description,
      isMedical: editItemCreationForm.itemType,
      itemCategoryID: editItemCreationForm.category,
      pharmacologyCategoryID: editItemCreationForm.pharmacology,
      manufacturerID: editItemCreationForm.manufacturer,
      isScheduledDrug: editItemCreationForm.drugType,
      providerServiceMapID: this.providerServiceMapID,
      modifiedBy: this.createdBy,
      itemID: this.itemID,
      sctCode: this.editSnomedCode,
      sctTerm: this.editSnomedName,
    };
    this.itemService.updateItem(updateItemObject).subscribe((response) => {
      this.dialogService.alert('Updated successfully', 'success');
      this.snomedEditFlag = false;
      this.disableSnomedCode = false;
      this.enableAlert = true;
      this.getAllItemsList(this.providerServiceMapID);
      this.showTable();
      console.log('Data to be update', response);
    });
  }

  searchSnomedEdit(term: any) {
    console.log('Tern', term);
    const searchTerm = term;
    if (searchTerm.length > 2) {
      const dialogRef = this.dialog.open(SnomedCodeSearchComponent, {
        data: { searchTerm: searchTerm },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('result', result);
        if (result) {
          this.editSnomedCode = result.snomedNo;
          this.editSnomedName = result.snomedTerm;

          this.snomedEditFlag = true;

          this.disableSnomedCode = true;

          this.enableAlert = false;
        } else {
          this.enableAlert = true;
          this.editSnomedCode = null;
          this.editSnomedName = null;
        }
      });
    }
  }

  onDeleteClickEdit() {
    this.dialogService
      .confirm('Confirm', 'Are you sure you want to delete?')
      .subscribe((response) => {
        if (response) {
          this.enableAlert = true;

          this.snomedEditFlag = false;
          this.disableSnomedCode = false;
          this.editSnomedCode = null;
          this.editSnomedName = null;
        }
      });
  }

  activateDeactivate(itemID: any, flag: any) {
    if (flag) {
      this.confirmMessage = 'Block';
    } else {
      this.confirmMessage = 'Unblock';
    }
    this.dialogService
      .confirm(
        'Confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            console.log('Deactivating or activating Obj', itemID, flag);
            this.itemService.itemActivationDeactivation(itemID, flag).subscribe(
              (res) => {
                console.log('Activation or deactivation response', res);
                this.dialogService.alert(
                  this.confirmMessage + 'ed successfully',
                  'success',
                );
                this.getAllItemsList(this.providerServiceMapID);
                this.create_filterTerm = '';
              },
              (err) => this.dialogService.alert(err, 'error'),
            );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }

  searchSnomed(term: string) {
    const searchTerm = term;
    if (searchTerm.length > 2) {
      const dialogRef = this.dialog.open(SnomedCodeSearchComponent, {
        data: { searchTerm: searchTerm },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('result', result);
        if (result) {
          this.testsnomedCode = result.snomedNo;
          this.testSnomedName = result.snomedTerm;

          this.snomedFlag = true;

          this.itemCreationForm.controls['testsnomedCode'].disable();

          this.enableAlert = false;
        } else {
          this.enableAlert = true;
          this.testsnomedCode = null;
          this.testSnomedName = null;
        }
      });
    }
  }

  onDeleteClick() {
    this.dialogService
      .confirm('Confirm', 'Are you sure you want to delete?')
      .subscribe((response) => {
        if (response) {
          this.enableAlert = true;

          this.snomedFlag = false;
          this.itemCreationForm.controls['testsnomedCode'].enable();
          this.testsnomedCode = null;
          this.testSnomedName = null;
        }
      });
  }
}

@Component({
  selector: 'app-edit-item-master-modal',
  templateUrl: './edit-item-master.html',
  styleUrls: ['./item-master.component.css'],
})
export class EditItemMasterModalComponent implements OnInit {
  providerServiceMapID: any;
  bool: any;
  itemType: any;
  code: any;
  name: any;
  category: any;
  dose: any;
  pharmacology: any;
  manufacturer: any;
  strength: any;
  uom: any;
  drugType: any;
  composition: any;
  route: any;
  description: any;

  categories: any = [];
  dosages: any = [];
  pharmacologies: any = [];
  manufacturers: any = [];
  measures: any = [];
  routes: any = [];

  @ViewChild('editItemCreationForm')
  editItemCreationForm!: NgForm;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public itemService: ItemService,
    public dialogRef: MatDialogRef<EditItemMasterModalComponent>,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    console.log('Initial value', this.data);
    this.setProviderServiceMapID(this.data);
  }
  setProviderServiceMapID(data: any) {
    this.providerServiceMapID = this.data.providerServiceMapID;
    console.log('psmid', this.providerServiceMapID);
    this.getCategoriesList(this.providerServiceMapID);
    this.getDosageList(this.providerServiceMapID);
    this.pharmacologiesList(this.providerServiceMapID);
    this.manufacturerList(this.providerServiceMapID);
    this.unitOfMeasuresList(this.providerServiceMapID);
    this.routeAdminList(this.providerServiceMapID);
    this.edit();
  }
  getCategoriesList(providerServiceMapID: any) {
    this.itemService
      .getAllItemsCategory(this.providerServiceMapID, 0)
      .subscribe((categoryResponse: any) => {
        this.categoriesSuccesshandler(categoryResponse),
          (err: any) => console.log('ERROR in fetching category list');
      });
  }
  categoriesSuccesshandler(categoryResponse: any) {
    this.categories = categoryResponse.data;
    console.log('categories List', this.categories);
  }
  getDosageList(providerServiceMapID: any) {
    this.itemService
      .getAllDosages(this.providerServiceMapID)
      .subscribe((dosageResponse: any) => {
        this.dosageSuccesshandler(dosageResponse),
          (err: any) => console.log('ERROR in fetching dosage list');
      });
  }
  dosageSuccesshandler(dosageResponse: any) {
    this.dosages = dosageResponse.data;
    console.log('dosage list', this.dosages);
  }
  pharmacologiesList(providerServiceMapID: any) {
    console.log('check inside pharma');

    this.itemService
      .getAllPharmacologyCategory(this.providerServiceMapID)
      .subscribe((pharmacologyResponse: any) => {
        console.log('pharmacologyResponse', pharmacologyResponse);

        this.pharmacologySuccesshandler(pharmacologyResponse),
          (err: any) => console.log('ERROR in fetching pharmacological list');
      });
  }
  pharmacologySuccesshandler(pharmacologyResponse: any) {
    this.pharmacologies = pharmacologyResponse.data;
    console.log('editpharmacology', this.pharmacologies);
  }
  manufacturerList(providerServiceMapID: any) {
    console.log('check inside manufacturer');

    this.itemService
      .getAllManufacturers(this.providerServiceMapID)
      .subscribe((manufacturerResponse: any) => {
        console.log('manufacturerResponse', manufacturerResponse);

        this.manufacturerSuccesshandler(manufacturerResponse),
          (err: any) => console.log('ERROR in fetching manufacturer list');
      });
  }
  manufacturerSuccesshandler(manufacturerResponse: any) {
    this.manufacturers = manufacturerResponse.data;
    console.log('manufacturers', this.manufacturers);
  }
  unitOfMeasuresList(providerServiceMapID: any) {
    console.log('check inside Uom');
    this.itemService
      .getAllUoms(this.providerServiceMapID)
      .subscribe((uomResponse: any) => {
        console.log('uomResponse', uomResponse);

        this.uomSuccesshandler(uomResponse),
          (err: any) => console.log('ERROR in fetching Uom list');
      });
  }
  uomSuccesshandler(uomResponse: any) {
    this.measures = uomResponse.data;
    console.log('measures', this.measures);
  }
  routeAdminList(providerServiceMapID: any) {
    console.log('check inside route');
    this.itemService
      .getAllRoutes(this.providerServiceMapID)
      .subscribe((routeResponse: any) => {
        console.log('routeResponse', routeResponse.data);
        this.routeSuccesshandler(routeResponse),
          (err: any) => console.log('ERROR in fetching route list');
      });
  }
  routeSuccesshandler(routeResponse: any) {
    this.routes = routeResponse.data;
    console.log('routes', this.routes);
  }
  edit() {
    this.itemType = this.data.isMedical;
    this.code = this.data.itemCode;
    this.name =
      this.data.itemName !== undefined && this.data.itemName !== null
        ? this.data.itemName.trim()
        : null;
    this.category = this.data.itemCategoryID;
    this.dose = this.data.itemFormID;
    this.pharmacology = this.data.pharmCategoryID;
    this.manufacturer = this.data.manufacturerID;
    this.strength = this.data.strength;
    this.uom = this.data.uomID;
    this.drugType = this.data.isScheduledDrug;
    this.composition = this.data.composition;
    this.route = this.data.routeID;
    this.description = this.data.itemDesc;
  }

  update() {
    const updateItemObject: any = {
      isMedical: this.itemType,
      itemCode: this.code,
      itemName:
        this.name !== undefined && this.name !== null ? this.name.trim() : null,
      itemDesc: this.description,
      itemCategoryID: this.category,
      itemFormID: this.dose,
      pharmacologyCategoryID: this.pharmacology,
      manufacturerID: this.manufacturer,
      strength: this.strength,
      uomID: this.uom,
      isScheduledDrug: this.drugType,
      composition: this.composition,
      routeID: this.route,
      status: 'active',
      providerServiceMapID: this.data.providerServiceMapID,
      itemID: this.data.itemID,
      modifiedBy: this.data.createdBy,
    };
    this.itemService.updateItem(updateItemObject).subscribe((response) => {
      console.log('Data to be update', response);
      this.dialogRef.close('success');
    });
  }
}
