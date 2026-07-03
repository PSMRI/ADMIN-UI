import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthGuard } from './services/authGuardService/auth-guard.services';
import { ConfigService } from './services/config/config.service';
import { DashboardHttpServices } from './services/dashboard-service/dashboard-service.service';
import { dataService } from './services/dataService/data.service';
import { ConfirmationDialogsService } from './services/dialog/confirmation.service';
import { HttpServices } from './services/http-services/http_services.service';
import { SpinnerService } from './services/spinnerService/spinner.service';
import { LanguageService } from './services/adminServices/AdminLanguage/language.service';
import { RoleService } from './services/adminServices/AdminRole/role.service';
import { ScreenService } from './services/adminServices/AdminScreen/screen.service';
import { ServicemasterService } from './services/adminServices/AdminService/servicemaster.service';
import { ViewVersionDetailsComponent } from './components/view-version-details/view-version-details.component';
import { MaterialModule } from './material.module';
import { AuthService } from './services/authentication/auth.service';
import { CommonDialogComponent } from './components/common-dialog/common-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonServices } from './services/inventory-services/commonServices';
import { VanMasterService } from './services/ProviderAdminServices/van-master-service.service';
import { MyAddressWithCopyPasteDirective } from './directives/address/myAddressWithCopyPaste.directive';
import { AnswerDirective } from './directives/answer/answer.directive';
import { DotallowDirective } from './directives/dotallow/dotallow';
import { DrugStrengthWithCopyPasteDirective } from './directives/drugStrength/drugStrengthWithCopyPaste.directive';
import { myEmailDirective } from './directives/email/myEmail.directive';
import { itemNameMasterDirective } from './directives/itemNameMaster/itemNameMaster.directive';
import { ItemNameWithSpecialCharCopyPasteDirective } from './directives/itemNameMaster/itemNameWithSpecialCharCopyPaste.directive';
import { myMobileNumberDirective } from './directives/MobileNumber/myMobileNumber.directive';
import { MyMobileNumberWithCopyPasteDirective } from './directives/MobileNumber/myMobileNumberWithCopyPaste.directive';
import {
  DLNODirective,
  PANDirective,
  VehicleNODirective,
  VehicleNONewDirective,
  agentID_oneDirective,
  agentID_twoDirective,
  measuringUnitDirective,
  myNameDirective,
  myName2Directive,
  myProviderNameDirective,
} from './directives/name/myName.directive';

import { myPasswordDirective } from './directives/password/myPassword.directive';
import { myQuestionnaireDirective } from './directives/questionnaire/questionnaire.directive';
import { mySmsTemplateDirective } from './directives/smsTemplate/smsTemplate.directive';
import { StringValidatorDirective } from './directives/stringValidator/stringValidator.directive';
import { MyTextareaDirective } from './directives/textarea/textArea.directive';
import { TextAreaWithCopyPasteDirective } from './directives/textarea/textAreaWithCopyPaste.directive';
import { userNameDirective } from './directives/userName/userName.directive';
import { userNameWithSpaceDirective } from './directives/userName/userNameWithSpace.directive';
import {
  MyNameWithCopyPasteDirective,
  MyProviderNameWithCopyPasteDirective,
  NameWithSpecialCharCopyPasteDirective,
  PanWithCopyPasteDirective,
  UserNameWithCopyPasteDirective,
  VehicleNoWithCopyPasteDirective,
  VehicleNoWithSpecialCharCopyPasteDirective,
} from './directives/name/myNameWithCopyPaste.directive';
import { myUserNameDirective } from './directives/address/myAddress.directive';
import { MyInputAreaDirective } from './directives/Inputfeild/inputFeild.directive';
import { SpinnerComponent } from './components/spinner/spinner.component';

@NgModule({
  declarations: [
    ViewVersionDetailsComponent,
    CommonDialogComponent,
    myUserNameDirective,
    MyAddressWithCopyPasteDirective,
    AnswerDirective,
    DotallowDirective,
    myEmailDirective,
    MyInputAreaDirective,
    itemNameMasterDirective,
    ItemNameWithSpecialCharCopyPasteDirective,
    myMobileNumberDirective,
    MyMobileNumberWithCopyPasteDirective,
    myNameDirective,
    myPasswordDirective,
    myQuestionnaireDirective,
    mySmsTemplateDirective,
    StringValidatorDirective,
    MyTextareaDirective,
    userNameDirective,
    userNameWithSpaceDirective,
    myName2Directive,
    agentID_oneDirective,
    agentID_twoDirective,
    myProviderNameDirective,
    PANDirective,
    VehicleNODirective,
    VehicleNONewDirective,
    measuringUnitDirective,
    DLNODirective,
    MyNameWithCopyPasteDirective,
    NameWithSpecialCharCopyPasteDirective,
    MyProviderNameWithCopyPasteDirective,
    VehicleNoWithCopyPasteDirective,
    VehicleNoWithSpecialCharCopyPasteDirective,
    PanWithCopyPasteDirective,
    UserNameWithCopyPasteDirective,
    TextAreaWithCopyPasteDirective,
    DrugStrengthWithCopyPasteDirective,
    SpinnerComponent,

    // ProviderAdminComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
  ],
  exports: [
    CommonDialogComponent,
    myUserNameDirective,
    MyAddressWithCopyPasteDirective,
    AnswerDirective,
    DotallowDirective,
    myEmailDirective,
    MyInputAreaDirective,
    itemNameMasterDirective,
    ItemNameWithSpecialCharCopyPasteDirective,
    MyMobileNumberWithCopyPasteDirective,
    myNameDirective,
    myPasswordDirective,
    myQuestionnaireDirective,
    mySmsTemplateDirective,
    StringValidatorDirective,
    MyTextareaDirective,
    userNameDirective,
    userNameWithSpaceDirective,
    myName2Directive,
    agentID_oneDirective,
    agentID_twoDirective,
    myProviderNameDirective,
    PANDirective,
    VehicleNODirective,
    VehicleNONewDirective,
    measuringUnitDirective,
    DLNODirective,
    MyNameWithCopyPasteDirective,
    NameWithSpecialCharCopyPasteDirective,
    MyProviderNameWithCopyPasteDirective,
    VehicleNoWithCopyPasteDirective,
    VehicleNoWithSpecialCharCopyPasteDirective,
    PanWithCopyPasteDirective,
    UserNameWithCopyPasteDirective,
    TextAreaWithCopyPasteDirective,
    myMobileNumberDirective,
    DrugStrengthWithCopyPasteDirective,
    SpinnerComponent,
  ],
  providers: [
    HttpClient,
    ConfigService,
    ConfirmationDialogsService,
    dataService,
    HttpServices,
    SpinnerService,
    AuthGuard,
    DashboardHttpServices,
    LanguageService,
    RoleService,
    ScreenService,
    ServicemasterService,
    CommonServices,
    VanMasterService,
  ],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        AuthGuard,
        AuthService,
        SpinnerService,
        ConfigService,
        ConfirmationDialogsService,
        dataService,
        HttpServices,
        DashboardHttpServices,
        LanguageService,
      ],
    };
  }
}
