// COMPONENTS
import { NavbarComponent } from './components/navbar/navbar.component';

// MODALS
import { CredentialModalComponent } from './modals/CredentialModal/credential-modal.component';
import { ChangePasswordModalComponent } from './modals/ChangePasswordModal/change-password-modal.component';
import { ShareCredentialModalComponent } from './modals/ShareCredentialModal/share-credential-modal.component';
import { ActionLogModalComponent } from './modals/ActionLogModal/action-log-modal.component';

// PIPES
import { FormatDatePipe } from './pipes/format-date.pipe';
import { FormatDateTimePipe } from './pipes/format-date-time.pipe';
import { InputErrorPipe } from './pipes/input-error.pipe';

// MODULES
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

const COMPONENTS = [
  NavbarComponent,
];

const MODALS = [
  CredentialModalComponent,
  ChangePasswordModalComponent,
  ShareCredentialModalComponent,
  ActionLogModalComponent,
];

const PIPES = [
  FormatDatePipe,
  FormatDateTimePipe,
  InputErrorPipe,
];

const MODULES = [
  CommonModule,
  RouterModule,
  I18NextModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  FormsModule,
  ReactiveFormsModule,
  MatDividerModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule,
  MatButtonModule,
  MatDialogModule,
  MatExpansionModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatSliderModule,
  MatToolbarModule,
  MatMenuModule,
];

@NgModule({
  imports: [
    MODULES,
  ],
  declarations: [
    COMPONENTS,
    PIPES,
    MODALS,
    NavbarComponent,
    CredentialModalComponent
  ],
  exports: [
    COMPONENTS,
    MODULES,
    PIPES,
    MODALS,
  ],
  providers: [
    PIPES,
  ],
  entryComponents: [
    MODALS,
  ],
})
export class SharedModule { }
