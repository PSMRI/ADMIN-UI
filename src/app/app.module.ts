import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './core/material.module';
import { AppRoutingModule } from './app-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpInterceptorService } from './core/services/httpInterceptor/http-interceptor.service';
import { loginContentClassComponent } from './user-login/login/login.component';
import { ResetComponent } from './user-login/resetPassword/resetPassword.component';
import { SetPasswordComponent } from './user-login/set-password/set-password.component';
import { SetSecurityQuestionsComponent } from './user-login/set-security-questions/set-security-questions.component';
import { UserLoginModule } from './user-login/user-login.module';
import { CoreModule } from './core/core.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { adminDataService } from './core/services/adminServices/SMSMaster/data.service';
import { dataService } from './core/services/dataService/data.service';
import { ConfirmationDialogsService } from './core/services/dialog/confirmation.service';
import { CommonServices } from './core/services/inventory-services/commonServices';
import { ItemCategoryService } from './core/services/inventory-services/item-category.service';
import { ManufacturemasterService } from './core/services/inventory-services/manufacturemaster.service';
import { PharmacologicalMasterService } from './core/services/inventory-services/pharmacological-category-service';
import { SuppliermasterService } from './core/services/inventory-services/suppliermaster.service';
import { MultiRoleScreenComponent } from './multi-role-screen/multi-role-screen.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { loginService } from './user-login/loginService/login.service';
import { ProviderAdminModule } from './app-provider-admin/provider-admin/provider-admin.module';
import { SuperAdminModule } from './app-provider-admin/super-admin/super-admin.module';
import { UtcDatePipe } from './app-provider-admin/provider-admin/configurations/utc-date.pipe';
import { UomMasterService } from './core/services/inventory-services/uom-master.service';
import { Mainstroreandsubstore } from './core/services/inventory-services/mainstoreandsubstore.service';
import { FacilityMasterService } from './core/services/inventory-services/facilitytypemaster.service';
import { ItemFacilityMappingService } from './core/services/inventory-services/item-facility-mapping.service';
import { StoreMappingService } from './core/services/inventory-services/store-mapping.service';
import {
  MatChipGrid,
  MatChipInput,
  MatChipsModule,
} from '@angular/material/chips';
import { CaptchaComponent } from './user-login/captcha/captcha.component';

@NgModule({
  declarations: [
    AppComponent,
    loginContentClassComponent,
    ResetComponent,
    SetPasswordComponent,
    SetSecurityQuestionsComponent,
    MultiRoleScreenComponent,
    CaptchaComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // entryComponents: [
  //   CommonDialogComponent,
  //   ViewVersionDetailsComponent,
  // ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    UserLoginModule,
    ProviderAdminModule,
    SuperAdminModule,
    CoreModule.forRoot(),
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatExpansionModule,
    MatChipsModule,
  ],
  providers: [
    CommonServices,
    SuppliermasterService,
    dataService,
    ConfirmationDialogsService,
    ManufacturemasterService,
    HttpClient,
    adminDataService,
    PharmacologicalMasterService,
    ItemCategoryService,
    loginService,
    UomMasterService,
    Mainstroreandsubstore,
    FacilityMasterService,
    ItemFacilityMappingService,
    StoreMappingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
