import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProviderAdminRoleService } from './services/state-serviceline-role.service';
import { MaterialModule } from 'src/app/core/material.module';
import {
  CallDispositionTypeMasterComponent,
  EditCallTypeComponent,
} from './call-disposition-type-master/call-disposition-type-master.component';
import { CategorySubcategoryProvisioningComponent } from './category-subcategory-provisioning/category-subcategory-provisioning.component';
import { EditCategorySubcategoryComponent } from './category-subcategory-provisioning/edit-category-subcategory/edit-category-subcategory.component';
import { EmployeeMasterNewComponent } from './employee-master-new/employee-master-new.component';
import {
  FeedbackTypeMasterComponent,
  EditFeedbackModalComponent,
} from './feedback-type-master/feedback-type-master.component';
import { EditInstituteDirectoryComponent } from './institute-directory-master/edit-institute-directory/edit-institute-directory.component';
import { InstituteDirectoryMasterComponent } from './institute-directory-master/institute-directory-master/institute-directory-master.component';
import { LanguageMappingComponent } from './language-mapping/language-mapping.component';
import {
  LocationServicelineMappingComponent,
  EditLocationModalComponent,
} from './location-serviceline-mapping/location-serviceline-mapping.component';
import { RoleMasterComponent } from './role-master/provider-admin-role-master.component';
import { ServicelineCdssMappingComponent } from './serviceline-cdss-mapping/servicelineCdssMapping.component';
import { SpecialistMappingComponent } from './specialist-mapping/specialist-mapping.component';
import { WorkLocationMappingComponent } from './work-location-mapping/work-location-mapping.component';
import { VillageMasterService } from 'src/app/core/services/adminServices/AdminVillage/village-master-service.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { CallTypeSubtypeService } from './services/calltype-subtype-master-service.service';
import { CategorySubcategoryService } from './services/category-subcategory-master-service.service';
import { EmployeeMasterNewServices } from './services/employee-master-new-services.service';
import { FeedbackTypeService } from './services/feedback-type-master-service.service';
import { InstituteDirectoryMasterService } from './services/institute-directory-master-service.service';
import { LanguageMapping } from './services/language-mapping.service';
import { LocationServicelineMapping } from './services/location-serviceline-mapping.service';
import { SpecialistMappingService } from './services/specialist-mapping.service';
import { WorkLocationMapping } from './services/work-location-mapping.service';
import {
  EditFeedbackNatureModalComponent,
  FeedbackComplaintNatureMasterComponent,
} from './feedback-complaint-nature-master/feedback-complaint-nature-master.component';
import { NatureOfComplaintCategoryMappingComponent } from './nature-of-complaint-category-mapping/nature-of-complaint-category-mapping.component';
import { NatureOfCompaintCategoryMappingService } from './services/nature-of-complaint-category-mapping.service';
import {
  EditInstituteTypeComponent,
  InstituteTypeMasterComponent,
} from './institute-type-master/institute-type-master.component';
import { InstituteTypeMasterService } from './services/institute-type-master-service.service';
import {
  EditHospitalModalComponent,
  HospitalMasterComponent,
} from './hospital-master/hospital-master.component';
import { HospitalMasterService } from './services/hospital-master-service.service';
import {
  EditSeverityModalComponent,
  SeverityTypeComponent,
} from './severity-type/severity-type.component';
import { SeverityTypeService } from 'src/app/core/services/ProviderAdminServices/severity-type-service';
import { DeviceIdMasterComponent } from './device-id-master/device-id-master.component';
import { FetosenseDeviceIdMasterService } from './services/fetosense-device-id-master-service.service';
import { FetosenseTestMasterComponent } from './fetosense-test-master/fetosense-test-master.component';
import { ProviderAdminFetosenseTestMasterService } from './services/fetosense-test-master-service.service';
import { ServicePointMasterService } from './services/service-point-master-services.service';
import { ProcedureMasterServiceService } from '../inventory/services/procedure-master-service.service';
import { ParkingPlaceMasterService } from 'src/app/core/services/ProviderAdminServices/parking-place-master-services.service';
import { BlockSubcenterMappingService } from './services/block-subcenter-mapping-service';
import { DataMappingBlockSubcenterComponent } from './data-mapping-block-subcenter/data-mapping-block-subcenter.component';
import { ZoneComponent } from './zone-list/zone.component';
import { ZoneDistrictMappingComponent } from './zone-district-mapping/zone-district-mapping.component';
import { ParkingPlaceComponent } from './parking-place-master/parking-place-master.component';
import { ParkingPlaceSubDistrictMappingComponent } from './parking-place-sub-district-mapping/parking-place-sub-district-mapping.component';
import { ServicePointComponent } from './service-point-master/service-point.component';
import { VanComponent } from './van-master/van-master.component';
import { ProcedureMasterComponent } from './procedure-master/procedure-master.component';
import { ZoneMasterService } from './services/zone-master-services.service';

@NgModule({
  declarations: [
    LocationServicelineMappingComponent,
    EditLocationModalComponent,
    EmployeeMasterNewComponent,
    LanguageMappingComponent,
    RoleMasterComponent,
    SpecialistMappingComponent,
    CallDispositionTypeMasterComponent,
    EditCallTypeComponent,
    ServicelineCdssMappingComponent,
    CategorySubcategoryProvisioningComponent,
    EditCategorySubcategoryComponent,
    FeedbackTypeMasterComponent,
    EditFeedbackModalComponent,
    InstituteDirectoryMasterComponent,
    EditInstituteDirectoryComponent,
    WorkLocationMappingComponent,
    InstituteDirectoryMasterComponent,
    FeedbackComplaintNatureMasterComponent,
    EditFeedbackNatureModalComponent,
    NatureOfComplaintCategoryMappingComponent,
    InstituteTypeMasterComponent,
    EditInstituteTypeComponent,
    HospitalMasterComponent,
    EditHospitalModalComponent,
    SeverityTypeComponent,
    EditSeverityModalComponent,
    DeviceIdMasterComponent,
    FetosenseTestMasterComponent,
    DataMappingBlockSubcenterComponent,
    ZoneComponent,
    ZoneDistrictMappingComponent,
    ParkingPlaceComponent,
    ParkingPlaceSubDistrictMappingComponent,
    ServicePointComponent,
    VanComponent,
    ProcedureMasterComponent,
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTableModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
  ],
  providers: [
    ProviderAdminRoleService,
    LocationServicelineMapping,
    CommonServices,
    EmployeeMasterNewServices,
    LanguageMapping,
    WorkLocationMapping,
    VillageMasterService,
    SpecialistMappingService,
    CallTypeSubtypeService,
    InstituteDirectoryMasterService,
    CategorySubcategoryService,
    FeedbackTypeService,
    NatureOfCompaintCategoryMappingService,
    InstituteTypeMasterService,
    HospitalMasterService,
    SeverityTypeService,
    FetosenseDeviceIdMasterService,
    ProviderAdminFetosenseTestMasterService,
    ServicePointMasterService,
    ProcedureMasterServiceService,
    ParkingPlaceMasterService,
    BlockSubcenterMappingService,
    ZoneMasterService,
  ],
  exports: [
    LocationServicelineMappingComponent,
    EditLocationModalComponent,
    EmployeeMasterNewComponent,
    LanguageMappingComponent,
    RoleMasterComponent,
    SpecialistMappingComponent,
    CallDispositionTypeMasterComponent,
    EditCallTypeComponent,
    ServicelineCdssMappingComponent,
    CategorySubcategoryProvisioningComponent,
    EditCategorySubcategoryComponent,
    FeedbackTypeMasterComponent,
    EditFeedbackModalComponent,
    InstituteDirectoryMasterComponent,
    EditInstituteDirectoryComponent,
    WorkLocationMappingComponent,
    InstituteDirectoryMasterComponent,
    FeedbackComplaintNatureMasterComponent,
    EditFeedbackNatureModalComponent,
    NatureOfComplaintCategoryMappingComponent,
    InstituteTypeMasterComponent,
    EditInstituteTypeComponent,
    HospitalMasterComponent,
    SeverityTypeComponent,
    EditSeverityModalComponent,
    DeviceIdMasterComponent,
    FetosenseTestMasterComponent,
    DataMappingBlockSubcenterComponent,
    ZoneComponent,
    ZoneDistrictMappingComponent,
    ParkingPlaceComponent,
    ParkingPlaceSubDistrictMappingComponent,
    ServicePointComponent,
    VanComponent,
    ProcedureMasterComponent,
  ],
})
export class ActivitiesModule {}
