import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditInstituteDirectoryComponent } from '../edit-institute-directory/edit-institute-directory.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { InstituteDirectoryMasterService } from '../../services/institute-directory-master-service.service';
import { NgForm } from '@angular/forms';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-institute-directory-master',
  templateUrl: './institute-directory-master.component.html',
  styleUrls: ['./institute-directory-master.component.css'],
})
export class InstituteDirectoryMasterComponent
  implements OnInit, AfterViewInit
{
  displayedColumns = [
    'sno',
    'instituteDirectory',
    'description',
    'edit',
    'action',
  ];
  displayAddedColumns = ['sno', 'instituteDirectory', 'description', 'action'];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  dataSource = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
  }
  bufferArray = new MatTableDataSource<any>();

  serviceProviderID: any;
  providerServiceMapID: any;
  state: any;
  service: any;
  instituteDirectory: any;
  description: any;

  states: any = [];
  services: any = [];

  searchResultArray: any = [];

  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  userID: any;
  nationalFlag: any;
  availableInstituteDirectory: any = [];
  instituteDirectoryExist = false;
  @ViewChild('instituteDir') instituteDir!: NgForm;
  constructor(
    public instituteDirectoryService: InstituteDirectoryMasterService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
  }
  ngOnInit() {
    this.userID = this.commonDataService.uid;

    //	this.instituteDirectoryService.getStates(this.serviceProviderID).subscribe(response=>this.getStatesSuccessHandeler(response)); // commented on 10/4/18(1097 regarding changes) Gursimran
    this.instituteDirectoryService
      .getServiceLinesNew(this.userID)
      .subscribe((response: any) => {
        this.successhandeler(response),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
          };
      });
  }
  successhandeler(res: any) {
    this.services = res.data.filter(function (item: any) {
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
    this.instituteDirectoryService.getStatesNew(obj).subscribe(
      (response) => this.getStatesSuccessHandeler(response, value),
      (err: any) => {
        console.log('error in fetching states', err);
        //this.alertService.alert(err, 'error');
      },
    );
  }
  getStatesSuccessHandeler(response: any, value: any) {
    this.states = response.data;
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setProviderServiceMapID(this.states[0].providerServiceMapID);
    } else {
      this.nationalFlag = value.isNational;
      this.showTableFlag = false;
      this.searchResultArray = [];
      this.dataSource.data = [];
    }
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.search();
  }
  search() {
    this.instituteDirectoryService
      .getInstituteDirectory(this.providerServiceMapID)
      .subscribe(
        (response) => this.getInstituteDirectorySuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error')
        },
      );
  }
  showForm() {
    this.showTableFlag = false;
    this.showFormFlag = true;

    this.disableSelection = true;
  }
  toggle_activate(instituteDirectoryID: any, isDeleted: any) {
    if (isDeleted === true) {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              instituteDirectoryID: instituteDirectoryID,
              deleted: isDeleted,
            };

            this.instituteDirectoryService
              .toggle_activate_InstituteDirectory(obj)
              .subscribe(
                (response) =>
                  this.toggleActivateSuccessHandeler(response, 'Deactivated'),
                (err: any) => {
                  console.log('Error', err);
                  //is.alertService.alert(err, 'error')
                },
              );
          }
        });
    }

    if (isDeleted === false) {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              instituteDirectoryID: instituteDirectoryID,
              deleted: isDeleted,
            };

            this.instituteDirectoryService
              .toggle_activate_InstituteDirectory(obj)
              .subscribe(
                (response) =>
                  this.toggleActivateSuccessHandeler(response, 'Activated'),
                (err: any) => {
                  console.log('Error', err);
                  //is.alertService.alert(err, 'error')
                },
              );
          }
        });
    }
  }
  toggleActivateSuccessHandeler(response: any, action: any) {
    console.log(response, 'delete Response');
    if (response) {
      this.alertService.alert(action + ' successfully', 'success');
      this.search();
    }
  }
  getInstituteDirectorySuccessHandeler(response: any) {
    console.log('search result', response);
    if (response && response.data) {
      this.showTableFlag = true;
      this.searchResultArray = response.data;
      this.dataSource.data = response.data;
      this.dataSource.paginator = this.paginator;
      for (const availableInstituteDirectory of this.searchResultArray) {
        this.availableInstituteDirectory.push(
          availableInstituteDirectory.instituteDirectoryName,
        );
      }
    }
  }
  openEditModal(toBeEditedOBJ: any) {
    const dialog_Ref = this.dialog.open(EditInstituteDirectoryComponent, {
      width: '700px',
      data: toBeEditedOBJ,
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.alertService.alert('Updated successfully', 'success');
        this.search();
      }
    });
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.searchResultArray;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'instituteDirectoryName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
          }
        }
        this.dataSource.paginator = this.paginator;
      });
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  checkexistance(instituteDirectory: any) {
    this.instituteDirectoryExist =
      this.availableInstituteDirectory.includes(instituteDirectory);
    console.log(this.instituteDirectoryExist);
  }
  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showTableFlag = true;
          this.showFormFlag = false;
          /*reset the input fields of the form*/
          this.instituteDirectory = '';
          this.description = '';
          this.bufferArray.data = [];

          this.disableSelection = false;
        }
      });
  }

  // add_obj(institute_directory: any, description: any) {
  //   const obj = {
  //     instituteDirectoryName: institute_directory,
  //     instituteDirectoryDesc: description,
  //     providerServiceMapId: this.providerServiceMapID,
  //     createdBy: this.commonDataService.uname,
  //   };

  //   if (
  //     this.bufferArray.data.length === 0 &&
  //     obj.instituteDirectoryName !== '' &&
  //     obj.instituteDirectoryName !== undefined
  //   ) {
  //     this.bufferArray.data.push(obj);
  //   } else {
  //     let count = 0;
  //     for (let i = 0; i < this.bufferArray.data.length; i++) {
  //       if (
  //         obj.instituteDirectoryName ===
  //         this.bufferArray.data[i].instituteDirectoryName
  //       ) {
  //         count = count + 1;
  //       }
  //     }

  //     if (
  //       count === 0 &&
  //       obj.instituteDirectoryName !== '' &&
  //       obj.instituteDirectoryName !== undefined
  //     ) {
  //       this.bufferArray.data.push(obj);
  //     } else {
  //       this.alertService.alert('Already exists');
  //     }
  //   }

  //   /*resetting fields after entering in buffer array/or if duplicate exist*/
  //   // this.instituteDirectory="";
  //   // this.description="";
  //   this.instituteDir.resetForm();
  // }
  add_obj(institute_directory: any, description: any) {
    const obj = {
      instituteDirectoryName: institute_directory,
      instituteDirectoryDesc: description,
      providerServiceMapId: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };

    const isDuplicate = this.bufferArray.data.some(
      (item) =>
        item.instituteDirectoryName.trim().toLowerCase() ===
        obj.instituteDirectoryName.trim().toLowerCase(),
    );

    if (!isDuplicate && obj.instituteDirectoryName.trim() !== '') {
      this.bufferArray.data = [...this.bufferArray.data, obj];
      this.instituteDir.resetForm();
    } else {
      this.alertService.alert(
        'Institute directory name already exists or is empty.',
      );
    }
  }

  removeObj(index: any) {
    const newData = [...this.bufferArray.data];
    newData.splice(index, 1);
    this.bufferArray.data = newData;
    this.cdr.detectChanges();
  }

  save() {
    this.instituteDirectoryService
      .saveInstituteDirectory(this.bufferArray.data)
      .subscribe(
        (response) => this.saveSuccessHandeler(response),
        (err: any) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error')
        },
      );
  }
  saveSuccessHandeler(response: any) {
    console.log('response', response);
    if (response) {
      this.alertService.alert('Saved successfully', 'success');
      this.instituteDir.resetForm();
      this.showFormFlag = false;
      this.bufferArray.data = [];
      this.search();
      this.disableSelection = false;
    }
  }
}
