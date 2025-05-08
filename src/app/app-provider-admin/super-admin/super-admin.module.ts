import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from 'src/app/core/material.module';
import { InventoryModule } from '../provider-admin/inventory/inventory.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { ActivitiesModule } from './super-admin/Activities/activities.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ConfigurationsModule } from './super-admin/configurations/congigurations.module';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  declarations: [SuperAdminComponent],
  exports: [SuperAdminComponent],
  imports: [
    CommonModule,
    ActivitiesModule,
    ConfigurationsModule,
    InventoryModule,
    BrowserModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatNativeDateModule,
    MatMenuModule,
    MatButtonModule,
    MatDatepickerModule,
    CoreModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class SuperAdminModule {}
