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
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-mapping-provider-admin-to-provider',
  templateUrl: './mapping-provider-admin-to-provider.component.html',
  styleUrls: ['./mapping-provider-admin-to-provider.component.css'],
})
export class MappingProviderAdminToProviderComponent
  implements OnInit, AfterViewInit
{
  displayedColumns = [
    'sno',
    'ProviderName',
    'ProviderAdminName',
    'Serviceline',
    'State',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'ProviderAdminName',
    'ProviderName',
    'Serviceline',
    'State',
    'action',
  ];

  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;

  ngAfterViewInit() {
    this.filteredproviderAdminList.paginator = this.paginatorFirst;
    this.bufferArray.paginator = this.paginatorSecond;
  }
  filteredproviderAdminList = new MatTableDataSource<any>();
  bufferArray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredproviderAdminList.paginator = this.paginatorFirst;
  }

  service_provider_array: any = [];
  service_provider_admin_array: any = [];
  states_array: any = [];
  services_array: any = [];

  isNational = false;
  providerServiceMapID_for1097: any;

  providerNameBeforeEdit: any;
  service_provider_admin: any;
  service_provider: any;
  provider: any;
  serviceline: any;
  state: any;
  serviceProviderMapID: any;
  edit_Details: any;
  uSRMappingID: any;
  serviceProviderID: any;
  providermapID: any;

  // arrays
  providers: any = [];
  servicelines: any = [];
  states: any = [];
  providerAdminList: any = [];
  filteredStates: any = [];
  edit_state: any;

  // flags
  formMode = false;
  tableMode = true;
  editMode = false;
  disableUsername = false;
  // variables
  createdBy: any;
  toBeEditedObject: any;

  @ViewChild('form')
  form!: NgForm;

  @ViewChild('myForm')
  myForm!: NgForm;

  constructor(
    public superadminService: SuperAdmin_ServiceProvider_Service,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.serviceProviderID = this.commonDataService.service_providerID;
    this.getAllMappedProviders();
    this.getAllProviders();
    this.getAllProviderAdmins();
  }
  //--start ** Populating Drop downs data from services
  getAllMappedProviders() {
    this.superadminService.getAllMappedProviders().subscribe(
      (response: any) => {
        if (response) {
          console.log('All Provider Admins Mapping Success Handeler', response);
          this.providerAdminList = response.data;
          this.filteredproviderAdminList.data = response.data;
        }
      },
      (err: any) => {
        console.log('Error', err);
      },
    );
  }
  getAllProviders() {
    this.superadminService.getAllProvider().subscribe(
      (response: any) => {
        if (response) {
          console.log('All Providers Success Handeler', response);
          this.service_provider_array = response.data;
        }
      },
      (err: any) => {
        console.log('Error', err);
      },
    );
  }
  getAllProviderAdmins() {
    this.superadminService.getAllProviderAdmins().subscribe(
      (response: any) => {
        if (response) {
          console.log('All Provider Admins Success Handeler', response.data);
          this.service_provider_admin_array = response.data;
          this.filteredStates = [];
        }
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  getProviderServices(serviceProvider: any) {
    this.superadminService
      .getProviderServices(
        serviceProvider.serviceProviderId || serviceProvider.serviceProviderID,
      )
      .subscribe(
        (response: any) => this.getServiceSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
        },
      );
  }
  getProviderServices_Edit(serviceProvider: any) {
    this.superadminService.getProviderServices(serviceProvider).subscribe(
      (response: any) => this.getServiceSuccessHandeler(response),
      (err: any) => {
        console.log('Error', err);
      },
    );
  }
  getServiceSuccessHandeler(response: any) {
    if (response.data) {
      console.log(response.data, 'Provider States');
      this.services_array = response.data;
    }
  }

  getProviderStatesInService(
    providerAdmin: any,
    serviceProvider: any,
    service: any,
    national: any,
  ) {
    this.superadminService
      .getProviderStatesInService(
        serviceProvider.serviceProviderId || serviceProvider.serviceProviderID,
        service.serviceID,
      )
      .subscribe((response: any) => {
        if (response) {
          console.log('Provider states in service', response.data);
          this.states_array = response.data;
          if (response.data.stateID === undefined) {
            this.providerServiceMapID_for1097 =
              this.states_array[0].providerServiceMapID;
          }
        }
        this.getAvailableStates(
          providerAdmin,
          serviceProvider.serviceProviderId ||
            serviceProvider.serviceProviderID,
          service,
          national,
        );
      });
  }
  getProviderStatesInService_edit(
    providerAdmin: any,
    serviceProvider: any,
    service: any,
    national: any,
  ) {
    if (national === 1) {
      national = true;
      this.edit_Details.stateID = undefined;
    } else {
      national = false;
    }
    this.superadminService
      .getProviderStatesInService(
        serviceProvider.serviceProviderId || serviceProvider.serviceProviderID,
        service,
      )
      .subscribe(
        (response: any) => {
          if (response) {
            console.log('Provider states in service', response.data);
            this.states_array = response.data;
            if (response.data.stateID === undefined) {
              this.providerServiceMapID_for1097 =
                this.states_array.providerServiceMapID;
            }
          }
          this.getAvailableStates_edit(
            providerAdmin,
            serviceProvider.serviceProviderId ||
              serviceProvider.serviceProviderID,
            service,
            national,
          );
          this.setIsNational(national);
        },
        (err: any) => {
          console.log('Error', err);
        },
      );
  }

  setIsNational(value: any) {
    this.isNational = value;
    if (value) {
      this.state = undefined;
      this.edit_state = undefined;
    }
  }

  getServicesSuccessHandeler(response: any) {
    if (response) {
      console.log('Provider Services in State', response.data);
      this.services_array = response.data;
    }
  }

  getAvailableStates(
    providerAdmin: any,
    serviceProviderId: any,
    service: any,
    national: any,
  ) {
    console.log(providerAdmin, service, national);
    const alreadyMappedStates: any = [];
    if (!national) {
      for (let i = 0; i < this.providerAdminList.length; i++) {
        if (
          this.providerAdminList[i].userID ===
            (providerAdmin.userID || providerAdmin) &&
          this.providerAdminList[i].serviceProviderID === serviceProviderId &&
          this.providerAdminList[i].serviceID === (service.serviceID || service)
        ) {
          if (this.providerAdminList[i].stateID !== undefined) {
            const obj = {
              stateID: this.providerAdminList[i].stateID,
              stateName: this.providerAdminList[i].stateName,
            };
            alreadyMappedStates.push(obj);
          }
        }
      }
      console.log('alredy ampped states', alreadyMappedStates);
      const filteredStates = this.states_array.filter(function (
        statesFromAllStates: any,
      ) {
        return !alreadyMappedStates.find(function (stateFromMappedstates: any) {
          return statesFromAllStates.stateID === stateFromMappedstates.stateID;
        });
      });
      console.log(this.filteredStates, 'Filtered states');
      console.log(filteredStates, 'const services');
      this.filteredStates = [];
      if (filteredStates.length === 0) {
        this.dialogService.alert(
          'All states for this serviceline have been mapped',
        );
      } else {
        this.filteredStates = filteredStates;
      }
    }
  }
  getAvailableStates_edit(
    providerAdmin: any,
    serviceProviderId: any,
    service: any,
    national: any,
  ) {
    console.log(providerAdmin, service, national);
    const alreadyMappedStates: any = [];
    if (!national) {
      for (let i = 0; i < this.providerAdminList.length; i++) {
        if (
          this.providerAdminList[i].userID === providerAdmin &&
          this.providerAdminList[i].serviceProviderID === serviceProviderId &&
          this.providerAdminList[i].serviceID === service
        ) {
          if (this.providerAdminList[i].stateID !== undefined) {
            const obj = {
              stateID: this.providerAdminList[i].stateID,
              stateName: this.providerAdminList[i].stateName,
            };
            alreadyMappedStates.push(obj);
          }
        }
      }
      console.log('alredy ampped states', alreadyMappedStates);
      const filteredStates = this.states_array.filter(function (
        statesFromAllStates: any,
      ) {
        return !alreadyMappedStates.find(function (stateFromMappedstates: any) {
          return statesFromAllStates.stateID === stateFromMappedstates.stateID;
        });
      });
      console.log(this.filteredStates, 'Filtered states');
      console.log(filteredStates, 'const services');
      this.filteredStates = [];
      if (filteredStates.length === 0) {
        this.dialogService.alert(
          'All states for this serviceline have been mapped',
        );
      } else {
        this.filteredStates = filteredStates;
      }
    }
  }
  showTable() {
    if (this.editMode) {
      this.tableMode = true;
      this.formMode = false;
      this.editMode = false;
      this.bufferArray.data = [];
      this.resetDropdowns();
    } else {
      this.tableMode = true;
      this.formMode = false;
      this.editMode = false;
      this.bufferArray.data = [];
      this.resetDropdowns();
    }
  }
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
  }
  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }
  add2bufferArray(form_values: any) {
    this.resetDropdowns();
    console.log(form_values, 'form values after adding');
    const object: any = {
      serviceProviderMapID1: [],
      userID: form_values.ProviderAdmin.userID,
      createdBy: this.createdBy,
      serviceName: form_values.Services.serviceName,
      serviceProviderName: form_values.serviceProvider.serviceProviderName,
      userName: form_values.ProviderAdmin.userName,
    };

    const providerServiceMapIDs = [];
    if (form_values.state !== undefined) {
      if (form_values.state.length > 0) {
        for (let a = 0; a < form_values.state.length; a++) {
          const obj = {
            serviceProviderMapID1: form_values.state[a].providerServiceMapID,
            stateName: form_values.state[a].stateName,
          };

          providerServiceMapIDs.push(obj);
        }

        object['serviceProviderMapID1'] = providerServiceMapIDs;
        this.checkDuplicates(object);
        this.filteredStates = [];
        this.services_array = [];
      }
    } else if (form_values.state === undefined) {
      const obj = {
        serviceProviderMapID1: this.providerServiceMapID_for1097,
        stateName: 'All states',
      };

      providerServiceMapIDs.push(obj);
      object['serviceProviderMapID1'] = providerServiceMapIDs;
      this.filteredStates = [];
      this.services_array = [];
      this.checkDuplicates(object);
      this.filteredStates = [];
      this.services_array = [];
    }
  }
  checkDuplicates(object: any) {
    console.log(object, 'BEFORE TESTING THE OBJECT SENT');
    /* case:1 If the buffer array is empty */
    if (this.bufferArray.data.length === 0) {
      this.bufferArray.data.push(object);
      this.bufferArray.paginator = this.paginatorSecond;
      console.log('bufferArray', this.bufferArray.data);
      this.resetForm();
    } else if (this.bufferArray.data.length > 0) {
      /* case:2 If the buffer array is not empty */
      let servicesMatched = false;
      let providerCount = 0;
      for (let a = 0; a < this.bufferArray.data.length; a++) {
        /* if the ProviderID of object in BufferArray is same as that of new object */
        if (
          this.bufferArray.data[a].serviceProviderName ===
            object.serviceProviderName &&
          this.bufferArray.data[a].userID === object.userID
        ) {
          providerCount = providerCount + 1;
          console.log(
            'this.bufferArray[a].userID',
            this.bufferArray.data[a].userID,
          );

          /* if the serviceID of object in BufferArray is same as that of new object */
          if (this.bufferArray.data[a].serviceName === object.serviceName) {
            servicesMatched = true;
            /* the loop will run i times , where i= no of objects in States Array
               of OBJECT sent for verification */
            for (let i = 0; i < object.serviceProviderMapID1.length; i++) {
              let count = 0; // counter to check if duplicate state comes for a 'Existing Provider and Existing Service'

              /* running second loop which will run j times , where j= no of objects in States Array
               of an OBJECT in buffer array */
              for (
                let j = 0;
                j < this.bufferArray.data[a].serviceProviderMapID1.length;
                j++
              ) {
                if (
                  this.bufferArray.data[a].serviceProviderMapID1[j]
                    .serviceProviderMapID1 ===
                  object.serviceProviderMapID1[i].serviceProviderMapID1
                ) {
                  count = count + 1;
                  console.log('Duplicate Combo Exists', count);
                }
              }
              if (count === 0) {
                this.bufferArray.data[a].serviceProviderMapID1.push(
                  object.serviceProviderMapID1[i],
                );
                this.resetForm();
              } else if (count > 0) {
                console.log(
                  'Duplicate Entry Already exists for ' +
                    object.serviceProviderMapID1[i].serviceName,
                );
                this.dialogService.alert('Already exists');
                this.resetForm();
              }
            }
          } else {
            continue;
          }
        }
      }
      if (servicesMatched === false) {
        this.bufferArray.data.push(object);
        this.bufferArray.paginator = this.paginatorSecond;
        console.log(this.bufferArray.data);
        this.changeDetectorRefs.detectChanges();
        this.resetForm();
      }
    }
  }
  mapServicelineState() {
    console.log(this.bufferArray.data, 'Request Object');
    const requestArray: any = Object.assign([], this.bufferArray.data);
    for (let i = 0; i < this.bufferArray.data.length; i++) {
      const array_set = [];
      for (let j = 0; j < requestArray[i].serviceProviderMapID1.length; j++) {
        array_set.push(
          requestArray[i].serviceProviderMapID1[j].serviceProviderMapID1,
        );
      }
      requestArray[i].serviceProviderMapID1 = array_set;
    }

    console.log('After modification', requestArray);
    this.bufferArray.data = [];

    this.superadminService.createMappingProviderAdmin(requestArray).subscribe(
      (response: any) => {
        console.log(
          response,
          'after successful mapping of provider to service and state',
        );
        this.dialogService.alert('Mapping saved successfully', 'success');
        this.showTable();
        this.getAllMappedProviders();
        this.resetDropdowns();
        this.filteredStates = [];
        this.services_array = [];
        this.states_array = [];
        this.bufferArray.data = [];
      },
      (err: any) => {
        console.log(err, 'ERROR');
      },
    );
  }
  resetForm() {
    if (this.form !== undefined && this.form !== null) {
      this.form.reset();
      this.provider = undefined;
      this.serviceline = undefined;
      this.state = undefined;
      this.uSRMappingID = undefined;
      this.edit_Details = undefined;
      this.changeDetectorRefs.detectChanges();
    }
  }
  removeService(rowIndex: any, serviceIndex: any) {
    this.bufferArray.data[rowIndex].serviceProviderMapID1.splice(
      serviceIndex,
      1,
    );
    if (this.bufferArray.data[rowIndex].serviceProviderMapID1.length === 0) {
      this.bufferArray.data.splice(rowIndex, 1);
    }
  }
  removeRow(index: any) {
    this.bufferArray.data.splice(index, 1);
  }
  back() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res: any) => {
        if (res) {
          this.showTable();
          this.resetForm();
          this.isNational = false;
        }
      });
  }
  activate(userID: any, providerexists: any, userexist: any) {
    if (providerexists) {
      this.dialogService.alert('Provider is inactive');
    } else if (userexist) {
      this.dialogService.alert('Provider Admin is inactive');
    } else {
      this.dialogService
        .confirm('Confirm', 'Are you sure want to Activate?')
        .subscribe((response: any) => {
          if (response) {
            const object = {
              uSRMappingID: userID,
              deleted: false,
            };

            this.superadminService.activateProviderAdmin(object).subscribe(
              (activatedresponse: any) => {
                if (activatedresponse) {
                  this.dialogService.alert('Activated successfully', 'success');
                  /* refresh table */
                  this.getAllMappedProviders();
                }
              },
              (err: any) => {
                console.log('error', err);
              },
            );
          }
        });
    }
  }
  deactivate(userID: any) {
    this.dialogService
      .confirm('Confirm', 'Are you sure want to Deactivate?')
      .subscribe((response: any) => {
        if (response) {
          const object = { uSRMappingID: userID, deleted: true };

          this.superadminService.deactivateProviderAdmin(object).subscribe(
            (deactivatedresponse: any) => {
              if (deactivatedresponse) {
                this.dialogService.alert('Deactivated successfully', 'success');
                /* refresh table */
                this.getAllMappedProviders();
              }
            },
            (err: any) => {
              console.log('error', err);
            },
          );
        }
      });
  }
  editRow(rowObject: any) {
    this.showEditForm();
    this.disableUsername = true;
    this.uSRMappingID = rowObject.uSRMappingID;
    this.providermapID = rowObject.providerServiceMapID;
    this.edit_Details = rowObject;
    this.edit_state = rowObject.stateID;
    this.getProviderServices(rowObject);
    if (rowObject.serviceName === '1097') {
      this.getProviderStatesInService_edit(
        this.edit_Details.userID,
        this.edit_Details,
        this.edit_Details.serviceID,
        this.edit_Details.serviceID,
      );
    } else {
      this.getProviderStatesInService_edit(
        this.edit_Details.userID,
        this.edit_Details,
        this.edit_Details.serviceID,
        this.edit_Details.serviceID,
      );
    }
  }
  getPrividerMapID(value: any) {
    this.providermapID = value;
  }
  update(editedDetails: any) {
    const duplicatecount = 0;
    const object = {
      uSRMappingID: this.uSRMappingID,
      providerServiceMapID: this.providermapID,
      userID: editedDetails.ProviderAdmin,
      modifiedBy: this.createdBy,
    };

    console.log('edited request object', object);
    this.superadminService.updateProviderAdminDetails(object).subscribe(
      (response: any) => {
        console.log('Edit success callback', response);
        this.dialogService.alert('Mapping updated successfully', 'success');
        /* resetting form and ngModels used in editing */
        this.resetDropdowns();
        this.getAllMappedProviders();
        this.showTable();
        this.edit_Details = '';
        this.uSRMappingID = '';
        this.providermapID = '';
      },
      (err: any) => {
        console.log('error', err);
      },
    );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredproviderAdminList.data = this.providerAdminList;
      this.filteredproviderAdminList.paginator = this.paginatorFirst;
    } else {
      this.filteredproviderAdminList.data = [];
      this.filteredproviderAdminList.paginator = this.paginatorFirst;
      this.providerAdminList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'serviceProviderName' ||
            key === 'firstName' ||
            key === 'serviceName' ||
            key === 'stateName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredproviderAdminList.data.push(item);
              break;
            }
          }
        }
        this.filteredproviderAdminList.paginator = this.paginatorFirst;
      });
    }
  }
  resetDropdowns() {
    this.service_provider_admin = undefined;
    this.service_provider = undefined;
    this.provider = undefined;
    this.serviceline = undefined;
  }
}
