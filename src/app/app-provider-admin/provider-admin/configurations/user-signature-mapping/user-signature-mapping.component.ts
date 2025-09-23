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
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { EmployeeParkingPlaceMappingService } from '../../activities/services/employee-parking-place-mapping.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, forkJoin, switchMap, takeUntil, Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-user-signature-mapping',
  templateUrl: './user-signature-mapping.component.html',
  styleUrls: ['./user-signature-mapping.component.css'],
})
export class UserSignatureMappingComponent implements OnInit {
  signUploadForm!: FormGroup;
  designations: any = [];
  userNames: any = [];
  signExist: any;
  fileList!: FileList;
  file: any;
  createdBy: any;
  serviceProviderID: any;
  public imagePath: any;
  imgURL: any;
  enableDownloadButton = false;
  displayedColumns: string[] = ['role', 'username', 'upload', 'download', 'view', 'active'];
  userSignatureTable: any[] = [];
  selectedUser: any;
  dataSource = new MatTableDataSource<any>([]);
  private destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    public employeeParkingPlaceMappingService: EmployeeParkingPlaceMappingService,
    private alertMessage: ConfirmationDialogsService,
    private dataService: dataService,
    readonly sessionstorage: SessionStorageService,
    private dialog: MatDialog,

  ) { }

  @ViewChild('signatureDialog') signatureDialog!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.signUploadForm = this.createSignUploadForm();
    this.createdBy = this.dataService.uname;
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.getDesignations();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = (data.role + data.username).toLowerCase();
      return dataStr.includes(filter);
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewChecked() {
    if (this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }

  createSignUploadForm() {
    return this.fb.group({
      designation: [null, Validators.required],
      username: [null, Validators.required],
    });
  }
  get designation() {
    return this.signUploadForm.controls['designation'].value;
  }
  get username() {
    return this.signUploadForm.controls['username'].value;
  }
  getDesignations() {
    this.employeeParkingPlaceMappingService.getDesignations().subscribe(
      (response: any) => {
        if (response && response.data) this.designations = response.data;
      },
      (err) => {
        console.log('designation not fetched');
      },
    );
  }


  getUserNames() {
    const reqObj = {
      designationID: this.designation.designationID,
      serviceProviderID: this.serviceProviderID,
    };

    this.employeeParkingPlaceMappingService
      .getUserNameBasedOnDesig(reqObj)
      .pipe(
        switchMap((response: any) => {
          if (!response?.data) return [];
          this.userNames = response.data;

          // map users to observables
          const requests = this.userNames.map((user: any) =>
            this.employeeParkingPlaceMappingService
              .checkUsersignatureExist(user.userID)
              .pipe(
                map((signRes: any) => ({
                  role: this.designation.designationName,
                  username: user.userName,
                  userID: user.userID,
                  signatureStatus: user?.signatureStatus || 'InActive',
                  signatureUrl: signRes?.data?.signatureUrl || null,
                  signExist: String(signRes?.data?.response).toLowerCase() === 'true',
                  active: signRes?.data?.active || false,
                  statusID: String(signRes?.data?.response).toLowerCase() === 'true',
                }))
              )
          );

          return forkJoin(requests).pipe(
            map(results => results as any[])
          ); // run all requests in parallel and cast result to any[]
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (usersWithSignatures: any[]) => {
          this.userSignatureTable = usersWithSignatures;
          this.dataSource.data = this.userSignatureTable;
        },
        () => console.log('Usernames not fetched')
      );
  }


  // When a user is selected
  checkUsersignExist() {
    this.imgURL = null;
    this.selectedUser = this.username; // Store selected user for table

    this.employeeParkingPlaceMappingService
      .checkUsersignatureExist(this.username.userID)
      .subscribe(
        (response: any) => {
          this.signExist = response.data.response;
          this.enableDownloadButton = this.signExist === 'true';

          // Fill table data (example format)
          this.userSignatureTable = [
            {
              role: this.designation.designationName,
              username: this.username.userName,
              signatureUrl: response.data.signatureUrl || null,
              active: response.data.active || false,
              userID: this.username.userID,
              statusID: this.username.statusID
            },
          ];
          this.dataSource.data = this.userSignatureTable
        },
        (err) => {
          console.log('Error while fetching response');
        }
      );
  }

  public message: any;

  preview(files: any, row: any) {

    this.selectedUser = row.userID;
    if (files.length === 0) return;

    const imgType = files[0].type;
    if (imgType.match(/image\/*/) === null) {
      this.alertMessage.alert('Only images are supported');
      return;
    }

    const reader = new FileReader();
    this.imagePath = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.checkImageSize(reader);
    };
  }

  checkImageSize(reader: any) {
    if (this.imagePath.size > 20000) {
      this.alertMessage.alert('Image size should be less than 20kb');
    } else {
      this.imgURL = reader.result;
    }
    this.checkDimensions(reader);
  }
  checkDimensions(reader: any) {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth >= 280 && img.naturalHeight >= 70) {
        this.alertMessage.alert(
          'Preferred pixels should be less than 280*70 pixels',
        );
        this.imgURL = null;
      } else {
        this.imgURL = reader.result;
      }
    };
    img.src = this.imgURL;
  }
  uploadSign() {
    const signObj = {
      createdBy: this.createdBy,
      fileName: this.imagePath.name,
      fileType: this.imagePath.type,
      userID: this.selectedUser,
      fileContent: this.imgURL !== undefined ? this.imgURL.split(',')[1] : '',
    };
    this.employeeParkingPlaceMappingService.uploadSignature(signObj).subscribe(
      (response) => {
        this.alertMessage.alert('Saved successfully', 'success');
        this.getUserNames(); // Refresh table to show new signature

        this.imgURL = null;
        this.signExist = null;
        this.enableDownloadButton = false;
      },
      (err) => {
        console.log('err');
        this.alertMessage.alert(err.errorMessage, 'error');
      },
    );
  }

  private processDownloadResponse(response: any): { filename: string; url: string } {
    let filename = 'signature.png';
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const utf8FilenameRegex = /filename\*\=UTF-8''(.+)/;
      const asciiFilenameRegex = /filename="?([^"]+)"?/;

      let matches = utf8FilenameRegex.exec(contentDisposition);
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1]);
      } else {
        matches = asciiFilenameRegex.exec(contentDisposition);
        if (matches?.[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }
    }
    // const blob = new Blob([response.body!], { type: response.body!.type });
    const body: Blob | null = response.body as Blob;
    if (!body) {
      throw new Error('Empty response body');
    }
    const blob = new Blob([body], { type: (body as any).type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    return { filename, url };
  }

  downloadSign(row: any) {
    this.employeeParkingPlaceMappingService
      .downloadSign(row?.userID)
      .subscribe(
        (response) => {
          const { filename, url } = this.processDownloadResponse(response);

          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();

          URL.revokeObjectURL(url);
        },
        (err) => {
          this.alertMessage.alert(err.errorMessage, 'error');
        }
      );
  }

  downloadSignature(userID: any): Observable<string> {
    return this.employeeParkingPlaceMappingService.downloadSign(userID).pipe(
      map((response) => {
        const { url } = this.processDownloadResponse(response);
        return url;
      })
    );
  }

  // View signature popup
  openSignatureDialog(row: any) {
    if (!row.userID) {
      this.alertMessage.alert('No signature uploaded for this user');
      return;
    }

    this.downloadSignature(row.userID).subscribe(
      (signatureUrl: string) => {
        // Open dialog with image
        this.dialogRef = this.dialog.open(this.signatureDialog, {
          width: '400px',
          data: {
            username: row.username,
            signatureUrl: signatureUrl
          },
        });
      },
      (err) => {
        this.alertMessage.alert('Error fetching signature', 'error');
      }
    );
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Toggle signature status
  toggleActive(row: any, action: boolean) {
    const req = { userID: row.userID, active: action, role: this.designation.designationName, username: row.username };
    this.alertMessage
      .confirm(
        'confirm',
        'Are you sure you want to ' + (action ? 'activate' : 'deactivate') + ' this signature?',
      ).subscribe(
        (res) => {
          if (res) {

            this.employeeParkingPlaceMappingService
              .activateOrDeActivateSignature(req)
              .subscribe(

                () => {
                  if (action)
                    this.alertMessage.alert('Signature has been Activated', 'success')
                  else
                    this.alertMessage.alert('Signature has been Deactivated', 'success');

                  this.getUserNames(); // Refresh table to show new signature

                },
                (err) => {
                  this.alertMessage.alert('Error updating status', 'error');
                  row.active = !row.active; // rollback on failure
                }
              );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }

  dialogRef: any;

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
