import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditItemCategoryComponent } from './item-category-master/edit-item-category/edit-item-category.component';
import { ItemCategoryMasterComponent } from './item-category-master/item-category-master.component';
import { ManufacturerMasterComponent } from './manufacturer-master/manufacturer-master.component';
import { PharmacologicalCategoryMasterComponent } from './pharmacological-category-master/pharmacological-category-master.component';
import { ItemService } from './services/item.service';
import { SupplierMasterComponent } from './supplier-master/supplier-master.component';
import { ExpiryDateAlertConfigurationComponent } from './expiry-date-alert-configuration/expiry-date-alert-configuration.component';
import { ItemIssueMethodConfigComponent } from './item-issue-method-config/item-issue-method-config.component';
import { SearchUomMasterComponent } from './uom-master/search-uom-master/search-uom-master.component';
import { CreateUomMasterComponent } from './uom-master/create-uom-master/create-uom-master.component';
import { UpdateUomMasterComponent } from './uom-master/update-uom-master/update-uom-master.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialModule } from 'src/app/core/material.module';
import { MatTableModule } from '@angular/material/table';
import {
  EditItemMasterModalComponent,
  ItemMasterComponent,
} from './item-master/item-master.component';
import { FacilityTypeMasterComponent } from './facility-type-master/facility-type-master.component';
import { MainStoreAndSubStoreComponent } from './main-store-and-sub-store/main-store-and-sub-store.component';
import { ItemToStoreMappingComponent } from './item-to-store-mapping/item-to-store-mapping.component';
import { ViewStoreMappingComponent } from './store-mapping/view-store-mapping/view-store-mapping.component';
import { UpdateStoreMappingComponent } from './store-mapping/update-store-mapping/update-store-mapping.component';
import { CreateStoreMappingComponent } from './store-mapping/create-store-mapping/create-store-mapping.component';
import { FacilityHierarchyComponent } from './facility-hierarchy/facility-hierarchy.component';

@NgModule({
  declarations: [
    SupplierMasterComponent,
    ManufacturerMasterComponent,
    PharmacologicalCategoryMasterComponent,
    ItemCategoryMasterComponent,
    EditItemCategoryComponent,
    ExpiryDateAlertConfigurationComponent,
    ItemIssueMethodConfigComponent,
    SearchUomMasterComponent,
    CreateUomMasterComponent,
    UpdateUomMasterComponent,
    ItemMasterComponent,
    EditItemMasterModalComponent,
    FacilityTypeMasterComponent,
    MainStoreAndSubStoreComponent,
    ItemToStoreMappingComponent,
    ViewStoreMappingComponent,
    UpdateStoreMappingComponent,
    CreateStoreMappingComponent,
    FacilityHierarchyComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    MatTableModule,
  ],
  providers: [ItemService],
  exports: [
    SupplierMasterComponent,
    ManufacturerMasterComponent,
    PharmacologicalCategoryMasterComponent,
    ItemCategoryMasterComponent,
    EditItemCategoryComponent,
    ExpiryDateAlertConfigurationComponent,
    ItemIssueMethodConfigComponent,
    SearchUomMasterComponent,
    CreateUomMasterComponent,
    UpdateUomMasterComponent,
    ItemMasterComponent,
    EditItemMasterModalComponent,
    FacilityTypeMasterComponent,
    MainStoreAndSubStoreComponent,
    ItemToStoreMappingComponent,
    ViewStoreMappingComponent,
    UpdateStoreMappingComponent,
    CreateStoreMappingComponent,
    FacilityHierarchyComponent,
  ],
})
export class InventoryModule {}
