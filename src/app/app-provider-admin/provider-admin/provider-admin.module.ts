import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitiesModule } from './activities/activities.module';
import { InventoryModule } from './inventory/inventory.module';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from 'src/app/core/material.module';
import { MapSnommedCTCodeComponent } from './configurations/map-snommed-ctcode/map-snommed-ctcode.component';
import { AddQuestionnaireComponent } from './configurations/questionnaire/add-questionnaire/add-questionnaire.component';
import { EditQuestionnaireComponent } from './configurations/questionnaire/edit-questionnaire/edit-questionnaire.component';
import { SmsTemplateComponent } from './configurations/sms-template/sms-template.component';
import { SnomedCodeSearchComponent } from './configurations/snomed-code-search/snomed-code-search.component';
import { ProviderAdminComponent } from './provider-admin.component';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { CoreModule } from 'src/app/core/core.module';
import { ConfigurationsModule } from './configurations/configurations.module';

@NgModule({
  declarations: [
    ProviderAdminComponent,
    // AddQuestionnaireComponent,
    // EditQuestionnaireComponent,
    // SnomedCodeSearchComponent,
    // MapSnommedCTCodeComponent,
    // SmsTemplateComponent,
  ],
  exports: [ProviderAdminComponent],
  imports: [
    CommonModule,
    ActivitiesModule,
    InventoryModule,
    ConfigurationsModule,
    BrowserModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatNativeDateModule,
    MatChipsModule,
    CoreModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class ProviderAdminModule {}
