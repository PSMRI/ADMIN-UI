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
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { SmsTemplateService } from '../services/sms-template-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

@Component({
  selector: 'app-sms-template',
  templateUrl: './sms-template.component.html',
  styleUrls: ['./sms-template.component.css'],
})
export class SmsTemplateComponent implements OnInit, AfterViewInit {
  providerServiceMapID: any;
  serviceID: any;
  // existing_templates: Array<any> = [];
  userID: any;
  service: any;
  showTableFlag = false;
  // new
  viewTemplate = false;

  showParameters = false;
  isReadonly = false;

  SMS_Types: any = [];
  smsType_ID_array: Array<any> = [];

  Parameters: Array<any> = [];
  Parameters_count: any;
  services: any = [];
  smsParameters: Array<any> = [];
  selectedParameterType: any;
  selectedParameterValues: Array<any> = [];

  // smsParameterMaps:Array<any> = [];

  @ViewChild('smsForm') Smsform1!: NgForm;
  @ViewChild('smsViewForm') smsViewForm!: NgForm;
  states: any;
  createForm = false;
  state: any;

  displayedColumns = [
    'sno',
    'smsTemplateName',
    'smsType',
    'smsTemplate',
    'view',
    'delete',
  ];

  smsParametersDisplayedColumns = [
    'sno',
    'smsParameterName',
    'smsParameterType',
    'smsParameterValue',
    'action',
  ];

  viewSMSparametersColumns = [
    'sno',
    'smsParameterName',
    'smsParameterType',
    'smsParameterValue',
  ];
  paginator!: MatPaginator;
  smsParameterPaginator!: MatPaginator;
  viewSMSparameterPaginator!: MatPaginator;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) set smsParaPaginator(spp: MatPaginator) {
    this.smsParameterPaginator = spp;
    this.setSmsParamterAttributes();
  }
  // @ViewChild(MatPaginator) smsParameterPaginator: MatPaginator | null = null;
  smsParameterData = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) set viewSMSparaPaginator(vsmp: MatPaginator) {
    this.viewSMSparameterPaginator = vsmp;
    this.seViewSmsParamterAttributes();
  }
  // @ViewChild(MatPaginator) viewSMSparameterPaginator: MatPaginator | null = null;
  viewSMSParameterTable = new MatTableDataSource<any>();

  constructor(
    public commonData: dataService,
    public sms_service: SmsTemplateService,
    public commonServices: CommonServices,
    public commonDataService: dataService,
    public commonDialogService: ConfirmationDialogsService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
  }

  setSmsParamterAttributes() {
    this.smsParameterData.paginator = this.smsParameterPaginator;
  }

  seViewSmsParamterAttributes() {
    this.viewSMSParameterTable.paginator = this.viewSMSparameterPaginator;
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    console.log('userID', this.userID);
    this.getAllServices();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.smsParameterData.paginator = this.smsParameterPaginator;
    this.viewSMSParameterTable.paginator = this.viewSMSparameterPaginator;
  }

  getAllServices() {
    this.commonServices.getServiceLines(this.userID).subscribe((response) => {
      console.log('serviceline', response);
      this.servicesSuccesshandler(response),
        (err: any) => console.log('ERROR in fetching serviceline');
    });
  }
  servicesSuccesshandler(res: any) {
    console.log('serviceres', res);
    this.services = res.data;
    // this.services = res.filter((item) => {
    //   console.log('item', item);
    // })
  }
  getStates(service: any) {
    this.serviceID = service.serviceID;
    this.commonServices
      .getStatesOnServices(this.userID, service.serviceID, false)
      .subscribe(
        (response) => this.getStatesSuccessHandeler(response, service),
        (err) => {
          console.log('error in fetching states');
        },
      );
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    console.log('psmid', this.providerServiceMapID);
    this.getSMStemplates(this.providerServiceMapID);
  }

  getStatesSuccessHandeler(response: any, service: any) {
    this.states = response.data;
  }

  getSMStemplates(providerServiceMapID: any) {
    this.sms_service.getSMStemplates(providerServiceMapID).subscribe(
      (response: any) => {
        if (response && response.data && response.data.length >= 0) {
          this.dataSource.data = response.data;
          this.dataSource.data.forEach((item: any, index: any) => {
            item.sno = index + 1;
          });
          this.dataSource.paginator = this.paginator;
          // code to extract(IDs) all those non deleted SMS-Types
          this.smsType_ID_array = [];
          this.showTableFlag = true;
          this.createForm = false;
          for (let i = 0; i < this.dataSource.data.length; i++) {
            if (this.dataSource.data[i]?.deleted === false) {
              if (this.dataSource.data[i]?.smsType && 
                this.dataSource.data[i]?.smsType?.smsTypeID !== undefined) {
                this.smsType_ID_array.push(
                  this.dataSource.data[i].smsType.smsTypeID);
              } else {
                this.smsType_ID_array.push(null);
              }
            }
          }
        }
      },
      (err) => {
        console.log('Error while fetching SMS templates', err);
      },
    );
  }

  showForm() {
    this.showTableFlag = false;
    this.createForm = true;
    this.getSMStypes(this.serviceID);
  }

  getSMStypes(serviceID: any) {
    this.sms_service.getSMStypes(serviceID).subscribe(
      (response: any) => {
        this.SMS_Types = response.data;

        if (this.smsType_ID_array.length > 0) {
          this.SMS_Types = this.SMS_Types.filter((object: any) => {
            return !this.smsType_ID_array.includes(object.smsTypeID);
          });
        }

        if (this.SMS_Types.length === 0) {
          this.commonDialogService.alert(
            'All SMS Types have been used and are those templates are active',
            'info',
          );
        }
      },
      (err) => {
        console.log(err, 'error while fetching sms types');
        this.commonDialogService.alert(err.errorMessage, 'error');
      },
    );
  }

  showTable() {
    this.showTableFlag = true;
    this.createForm = false;
    this.viewTemplate = false;
    this.cancel();
    this.getSMStemplates(this.providerServiceMapID);
  }

  ActivateDeactivate(object: any, flag: any) {
    object.deleted = flag;
    object.modifiedBy = this.commonData.Userdata.userName;
    this.sms_service.updateSMStemplate(object).subscribe(
      (response) => {
        if (response) {
          if (flag) {
            this.commonDialogService.alert(
              'Deactivated successfully',
              'success',
            );
            this.getSMStemplates(this.providerServiceMapID);
          } else {
            this.commonDialogService.alert('Activated successfully', 'success');
            this.getSMStemplates(this.providerServiceMapID);
          }
        }
      },
      (err) => { },
    );
  }

  extractParameters(string: any) {
    this.Parameters = [];
    const parameters = [];

    let string_contents = [];

    const regex = /[!?.,\n]/g;
    string_contents = string.replace(regex, ' ').split(' ');

    for (let i = 0; i < string_contents.length; i++) {
      if (
        string_contents[i].startsWith('$$') &&
        string_contents[i].endsWith('$$')
      ) {
        const item = string_contents[i].substr(2).slice(0, -2);
        console.log(item);
        parameters.push(item);
      }
    }

    this.Parameters = parameters.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });

    this.Parameters.push('SMS_PHONE_NO');
    this.Parameters_count = this.Parameters.length;

    if (this.Parameters.length > 0) {
      this.showParameters = true;
      this.isReadonly = true;
      // this.getSMSparameters();
    } else {
      this.commonDialogService.alert(
        'No parameters identified in sms template',
        'info',
      );
    }
  }

  getSMSparameters() {
    this.smsParameters = [];
    this.selectedParameterValues = [];
    this.sms_service.getSMSparameters(this.serviceID).subscribe(
      (response: any) => {
        this.smsParameters = response.data;
      },
      (err) => {
        console.log(err, 'error while fetching sms parameters');
        this.commonDialogService.alert(err.errorMessage, 'error');
      },
    );
  }

  setValuesInDropdown(parameter_object: any) {
    this.selectedParameterType = parameter_object.smsParameterType;
    this.selectedParameterValues = parameter_object.smsParameters;
  }

  cancel() {
    this.Parameters_count = undefined;
    this.isReadonly = false;
    this.showParameters = false;
    this.smsParameterData.data = [];
    this.smsParameterData.paginator = this.smsParameterPaginator;
  }

  add(form_values: any) {
    const reqObj = {
      createdBy: this.commonData.Userdata.userName,
      modifiedBy: this.commonData.Userdata.userName,
      smsParameterName: form_values.parameter,
      smsParameterType: form_values.value.smsParameterType,
      smsParameterID: form_values.value.smsParameterID,
      smsParameterValue: form_values.value.smsParameterName,
    };
    if (
      reqObj.smsParameterName !== undefined &&
      reqObj.smsParameterType !== undefined &&
      reqObj.smsParameterID !== undefined
    ) {
      this.smsParameterData.data.push(reqObj);
      this.smsParameterData.data.forEach((item: any, index: any) => {
        item.sno = index + 1;
      });
      this.smsParameterData.paginator = this.paginator;
    } else {
      this.commonDialogService.alert(
        'Parameter, Value Type and Value should be selected',
        'info',
      );
    }

    // removing of the parameters pushed into buffer from the Parameters array and resetting of next two dropdowns
    this.Parameters.splice(this.Parameters.indexOf(form_values.parameter), 1);
    this.smsParameters = [];
    this.selectedParameterValues = [];
  }

  remove(obj: any, S_no: any) {
    const index = S_no - 1;
    this.smsParameterData.data.splice(index, 1);
    this.smsParameterData.paginator = this.paginator;

    // putting back the respective Parameter if is row is deleted from buffer array
    this.Parameters.push(obj.smsParameterName);
    // this.smsParameters = [];
    // this.selectedParameterValues = [];

    //getting sms parameters

    this.getSMSparameters();
  }

  saveSMStemplate(form_values: any) {
    const requestObject = {
      createdBy: this.commonData.Userdata.userName,
      providerServiceMapID: this.providerServiceMapID,
      smsParameterMaps: this.smsParameterData.data,
      smsTemplate: form_values.smsTemplate,
      smsTemplateName:
        form_values.templateName !== undefined &&
          form_values.templateName !== null
          ? form_values.templateName.trim()
          : null,
      smsTypeID: form_values.smsType,
    };

    console.log('Save Request', requestObject);

    this.sms_service.saveSMStemplate(requestObject).subscribe(
      (res) => {
        this.commonDialogService.alert(
          'Template saved successfully',
          'success',
        );
        this.showTable();
      },
      (err) => {
        this.commonDialogService.alert(err.errorMessage, 'error');
      },
    );
  }

  view(object: any) {
    console.log('templateID', object);

    this.sms_service
      .getFullSMSTemplate(object.providerServiceMapID, object.smsTemplateID)
      .subscribe(
        (response: any) => {
          console.log(response, 'getfullSMStemplate success');
          this.viewSMSParameterTable.data = response.data.smsParameterMaps;
          this.viewSMSParameterTable.data.forEach((item: any, index: any) => {
            item.sno = index + 1;
          });
          this.viewSMSParameterTable.paginator = this.paginator;
          this.viewTemplate = true;
          this.showTableFlag = false;
          this.smsViewForm.form.patchValue({
            templateName: response.data.smsTemplateName,
            smsType: response.data.smsType.smsType,
            smsTemplate: response.data.smsTemplate,
          });
        },
        (err) => {
          console.log(err, 'getfullSMStemplate error');
        },
      );
  }
}
