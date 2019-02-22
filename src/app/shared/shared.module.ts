import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatSelectModule, MatOptionModule, MatPaginatorModule,
MatExpansionModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatDividerModule,
MAT_CHECKBOX_CLICK_ACTION, MatRadioModule, MatChipsModule, MatSnackBarModule, MatStepperModule,
MatProgressBarModule, MatListModule, MatBadgeModule, MatTabsModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSortModule } from '@angular/material/sort';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';
import { MatMenuModule } from '@angular/material/menu';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IconSvgComponent } from '../components/icon-svg/icon-svg.component';
import { BoxDashboardComponent } from '../components/box/box-dashboard/box-dashboard.component';
import { BoxSettingComponent } from '../components/box/box-setting/box-setting.component';
import { BoxPropertiesComponent } from '../components/box/box-properties/box-properties.component';
import { TableComponent } from '../components/table/table.component';
import { TableSearchComponent } from '../components/table/table-search/table-search.component';
import { TableMobileComponent } from '../components/table/table-mobile/table-mobile.component';
import { TableMobileSearchComponent } from '../components/table/table-mobile-search/table-mobile-search.component';
import { TableDistributionComponent } from '../components/table/table-distribution/table-distribution.component';
import { TableMobileDistributionComponent } from '../components/table/table-mobile-distribution/table-mobile-distribution.component';
import { TableSmallComponent } from '../components/table/table-small/table-small.component';
import { TableSmallMobileComponent } from '../components/table/table-small-mobile/table-small-mobile.component';
import { TableDashboardComponent } from '../components/table/table-dashboard/table-dashboard.component';
import { ModalComponent } from '../components/modals/modal.component';
import { ModalDeleteComponent } from '../components/modals/modal-delete/modal-delete.component';
import { ModalUpdateComponent } from '../components/modals/modal-update/modal-update.component';
import { ModalDetailsComponent } from '../components/modals/modal-details/modal-details.component';
import { ModalAddComponent } from '../components/modals/modal-add/modal-add.component';
import { ModalAddLineComponent } from '../components/modals/modal-add/modal-add-line/modal-add-line.component';
import { ModalLanguageComponent } from '../components/modals/modal-language/modal-language.component';

import { LoginComponent } from '../modules/public/login.component';
import { DashboardComponent } from '../modules/dashboard/dashboard.component';
import { BeneficiariesComponent } from '../modules/beneficiary/beneficiaries.component';
import { ProjectComponent } from '../modules/projects/project.component';
import { AddDistributionComponent } from '../modules/projects/add-distribution/add-distribution.component';
import { SettingsComponent } from '../modules/settings/settings.component';
import { BeneficiariesImportComponent } from '../modules/beneficiary/beneficiaries-import/beneficiaries-import.component';
import { DataValidationComponent } from '../modules/beneficiary/data-validation/data-validation.component';
import { DistributionsComponent } from '../modules/projects/distributions/distributions.component';
import { ImportDistributionComponent } from '../modules/projects/distributions/import-distribution/import-distribution.component';
import { TransactionTableMobileComponent } from '../components/table/transaction-table-mobile/transaction-table-mobile.component';
import { ModalLeaveComponent } from '../components/modals/modal-leave/modal-leave.component';
import { TableMobileDashboardComponent } from '../components/table/table-mobile-dashboard/table-mobile-dashboard.component';
import { PlaceholderSummaryComponent } from '../components/placeholders/placeholder-summary/placeholder-summary.component';
import { PlaceholderBoxlineComponent } from '../components/placeholders/placeholder-boxline/placeholder-boxline.component';
import { PlaceholderPanelComponent } from '../components/placeholders/placeholder-panel/placeholder-panel.component';
import { PlaceholderStepperComponent } from '../components/placeholders/placeholder-stepper/placeholder-stepper.component';
import { PlaceholderTitleComponent } from '../components/placeholders/placeholder-title/placeholder-title.component';
import { TableBeneficiariesComponent } from '../components/table/table-beneficiaries/table-beneficiaries.component';
import { UpdateBeneficiaryComponent } from '../modules/beneficiary/update-beneficiary/update-beneficiary.component';
import { TransactionTableComponent } from '../components/table/transaction-table/transaction-table.component';
import { TableMobileBeneficiariesComponent } from '../components/table/table-mobile-beneficiaries/table-mobile-beneficiaries.component';
import { CountoModule } from 'angular2-counto';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImportedDataComponent } from '../modules/beneficiary/beneficiaries-import/imported-data/imported-data.component';
import { ModalRequestsComponent } from '../components/modals/modal-requests/modal-requests.component';
import { RecaptchaModule } from 'angular-google-recaptcha';
import { ThousandsPipe } from 'src/app/core/utils/thousands.pipe';

import { VouchersComponent } from '../modules/vouchers/vouchers.component'; 
import { TableVouchersComponent } from '../components/table/table-vouchers/table-vouchers.component';
import { TableMobileVouchersComponent } from '../components/table/table-mobile-vouchers/table-mobile-vouchers.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ScannerComponent } from '../modules/vouchers/scanner/scanner.component';

@NgModule({
imports: [
    RouterModule,
    CommonModule, // to use instead of BrowserModule if you are using lazyloaded module
    FormsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule,
    MatTableModule,
    MatOptionModule,
    MatButtonModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatBadgeModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatDividerModule,
    MatRadioModule,
    MatChipsModule,
    MatSnackBarModule,
    MatStepperModule,
    MatProgressBarModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatTabsModule,
    MatChipsModule,
    MatToolbarModule,
    MatAutocompleteModule,
    MatGridListModule,
    CountoModule,
    NgSelectModule,
    ZXingScannerModule,
    RecaptchaModule.forRoot({
        siteKey: '6LdJjIAUAAAAAFHrAB20mjuVhwRsLhTgfq4ioeaO',
    }),
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' })
    ],
declarations: [
    // Shared Components
    LoginComponent,
    DashboardComponent,
    BeneficiariesComponent,
    BeneficiariesImportComponent,
    ProjectComponent,
    AddDistributionComponent,
    SettingsComponent,
    IconSvgComponent,
    BoxDashboardComponent,
    TableComponent,
    TableSearchComponent,
    TableMobileComponent,
    TableMobileSearchComponent,
    TableDistributionComponent,
    TableMobileDistributionComponent,
    TableSmallComponent,
    TableSmallMobileComponent,
    TableDashboardComponent,
    TableMobileDashboardComponent,
    TableBeneficiariesComponent,
    TransactionTableMobileComponent,
    TableMobileBeneficiariesComponent,
    TransactionTableComponent,
    ModalComponent,
    ModalDeleteComponent,
    ModalUpdateComponent,
    ModalAddComponent,
    ModalDetailsComponent,
    ModalLanguageComponent,
    ModalAddLineComponent,
    BoxSettingComponent,
    BoxPropertiesComponent,
    DataValidationComponent,
    DistributionsComponent,
    ImportDistributionComponent,
    PlaceholderSummaryComponent,
    PlaceholderBoxlineComponent,
    PlaceholderPanelComponent,
    PlaceholderStepperComponent,
    PlaceholderTitleComponent,
    UpdateBeneficiaryComponent,
    ImportedDataComponent,
    ThousandsPipe,

    VouchersComponent,
    TableVouchersComponent,
    TableMobileVouchersComponent,
    ScannerComponent,
],
entryComponents: [
    ModalComponent,
    ModalDeleteComponent,
    ModalUpdateComponent,
    ModalDetailsComponent,
    ModalLanguageComponent,
    ModalAddComponent,
    ModalAddLineComponent,
    ModalLeaveComponent,
    ModalRequestsComponent,
],
exports: [
// Shared Components
    LoginComponent,
    DashboardComponent,
    BeneficiariesComponent,
    BeneficiariesImportComponent,
    ProjectComponent,
    AddDistributionComponent,
    SettingsComponent,
    IconSvgComponent,
    BoxDashboardComponent,
    BoxPropertiesComponent,
    TableComponent,
    TableSearchComponent,
    TableMobileComponent,
    TableMobileSearchComponent,
    TableDistributionComponent,
    TableMobileDistributionComponent,
    TableSmallComponent,
    TableSmallMobileComponent,
    TableMobileBeneficiariesComponent,
    TransactionTableComponent,
    TableDashboardComponent,
    TableMobileDashboardComponent,
    TableBeneficiariesComponent,
    TransactionTableMobileComponent,
    ModalComponent,
    ModalDeleteComponent,
    ModalUpdateComponent,
    ModalDetailsComponent,
    ModalLanguageComponent,
    ModalAddComponent,
    ModalAddLineComponent,
    BoxSettingComponent,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule,
    MatTableModule,
    MatOptionModule,
    MatButtonModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatSelectModule,
    DataValidationComponent,
    MatDividerModule,
    MatRadioModule,
    MatChipsModule,
    MatSnackBarModule,
    MatStepperModule,
    MatProgressBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatBadgeModule,
    MatChipsModule,
    MatAutocompleteModule,
    PlaceholderSummaryComponent,
    PlaceholderBoxlineComponent,
    PlaceholderPanelComponent,
    PlaceholderStepperComponent,
    PlaceholderTitleComponent,
],
providers: [
{ provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check' }
]
})
export class SharedModule { }
