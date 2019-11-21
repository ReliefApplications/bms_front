import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// tslint:disable-next-line
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule, MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CountoModule } from 'angular2-counto';
import { RecaptchaModule, RecaptchaSettings, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { FormatCamelCasePipe } from 'src/app/shared/pipes/format-camel-case.pipe';
import { ThousandsPipe } from 'src/app/shared/pipes/thousands.pipe';
import { UppercaseFirstPipe } from 'src/app/shared/pipes/uppercase-first.pipe';
import { BoxDashboardComponent } from '../components/box/box-dashboard/box-dashboard.component';
import { BoxPropertiesComponent } from '../components/box/box-properties/box-properties.component';
import { BoxSettingComponent } from '../components/box/box-setting/box-setting.component';
import { DatePickerComponent } from '../components/date-pickers/date-picker/date-picker.component';
import { MonthPickerComponent } from '../components/date-pickers/month-picker/month-picker.component';
import { YearPickerComponent } from '../components/date-pickers/year-picker/year-picker.component';
import { DisplayFieldComponent } from '../components/display-field/display-field.component';
import { HintErrorComponent } from '../components/hint-error/hint-error.component';
import { AdmFormComponent } from '../components/adm-form/adm-form.component';
import { IconSvgComponent } from '../components/icon-svg/icon-svg.component';
import { ModalAddBeneficiaryComponent } from '../components/modals/modal-add-beneficiary/modal-add-beneficiary.component';
import { ModalAddCommodityComponent } from '../components/modals/modal-add-commodity/modal-add-commodity.component';
import { ModalAddCriteriaComponent } from '../components/modals/modal-add-criteria/modal-add-criteria.component';
import { ModalAddComponent } from '../components/modals/modal-add/modal-add.component';
import { ModalAssignComponent } from '../components/modals/modal-assign/modal-assign.component';
import { ModalConfirmationComponent } from '../components/modals/modal-confirmation/modal-confirmation.component';
import { ModalDeleteBeneficiaryComponent } from '../components/modals/modal-delete-beneficiary/modal-delete-beneficiary.component';
import { ModalDeleteComponent } from '../components/modals/modal-delete/modal-delete.component';
import { ModalDetailsComponent } from '../components/modals/modal-details/modal-details.component';
import { ModalEditComponent } from '../components/modals/modal-edit/modal-edit.component';
import { ModalFieldsComponent } from '../components/modals/modal-fields/modal-fields.component';
import { ModalLanguageComponent } from '../components/modals/modal-language/modal-language.component';
import { ModalRequestsComponent } from '../components/modals/modal-requests/modal-requests.component';
import { PlaceholderBoxlineComponent } from '../components/placeholders/placeholder-boxline/placeholder-boxline.component';
import { PlaceholderPanelComponent } from '../components/placeholders/placeholder-panel/placeholder-panel.component';
import { PlaceholderStepperComponent } from '../components/placeholders/placeholder-stepper/placeholder-stepper.component';
import { PlaceholderSummaryComponent } from '../components/placeholders/placeholder-summary/placeholder-summary.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { TableMobileServerComponent } from '../components/table/table-mobile-server/table-mobile-server.component';
import { TableMobileComponent } from '../components/table/table-mobile/table-mobile.component';
import { TableServerComponent } from '../components/table/table-server/table-server.component';
import { TableComponent } from '../components/table/table.component';
import { MobilePressDirective } from '../core/directives/mobile-press.directive';
import { AdministrationComponent } from '../modules/administration/administration.component';
import { BeneficiariesImportComponent } from '../modules/beneficiaries/beneficiaries-import/beneficiaries-import.component';
import { ImportedDataComponent } from '../modules/beneficiaries/beneficiaries-import/imported-data/imported-data.component';
import { BeneficiariesComponent } from '../modules/beneficiaries/beneficiaries.component';
import { DataValidationComponent } from '../modules/beneficiaries/data-validation/data-validation.component';
import { BeneficiaryFormComponent } from '../modules/beneficiaries/update-beneficiary/beneficiary-form/beneficiary-form.component';
import { LocationFormComponent } from '../modules/beneficiaries/update-beneficiary/location-form/location-form.component';
import { UpdateBeneficiaryComponent } from '../modules/beneficiaries/update-beneficiary/update-beneficiary.component';
import { DashboardComponent } from '../modules/dashboard/dashboard.component';
import { GeneralSettingsComponent } from '../modules/general-settings/general-settings.component';
import { AddDistributionComponent } from '../modules/projects/add-distribution/add-distribution.component';
import { DistributionsComponent } from '../modules/projects/distributions/distributions.component';
import { ImportDistributionComponent } from '../modules/projects/distributions/import-distribution/import-distribution.component';
// tslint:disable-next-line
import { NotValidatedDistributionComponent } from '../modules/projects/distributions/not-validated-distribution/not-validated-distribution.component';
import { GeneralReliefComponent } from '../modules/projects/distributions/validated-components/general-relief/general-relief.component';
import { MobileMoneyComponent } from '../modules/projects/distributions/validated-components/mobile-money/mobile-money.component';
import { QrVoucherComponent } from '../modules/projects/distributions/validated-components/qr-voucher/qr-voucher.component';
import { ValidatedDistributionComponent } from '../modules/projects/distributions/validated-components/validated-distribution.component';
import { ProjectComponent } from '../modules/projects/project.component';
import { LoginComponent } from '../modules/public/login.component';
import { ScannerComponent } from '../modules/vouchers/scanner/scanner.component';
import { VouchersComponent } from '../modules/vouchers/vouchers.component';
import { LogsComponent } from '../modules/logs/logs.component';
import { SsoComponent } from '../modules/sso/sso.component';
import { JsonFormComponent } from '../components/json-form/json-form.component';


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
    MatRippleModule,
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
    RecaptchaModule,
    ZXingScannerModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' })
    ],
    declarations: [
        // Shared Components
        MobilePressDirective,
        LoginComponent,
        DashboardComponent,
        BeneficiariesComponent,
        BeneficiariesImportComponent,
        DatePickerComponent,
        MonthPickerComponent,
        YearPickerComponent,
        ProjectComponent,
        AddDistributionComponent,
        GeneralSettingsComponent,
        IconSvgComponent,
        BoxDashboardComponent,
        TableComponent,
        TableMobileComponent,
        TableServerComponent,
        TableMobileServerComponent,
        ModalAddCriteriaComponent,
        ModalAddCommodityComponent,
        ModalFieldsComponent,
        ModalDeleteComponent,
        ModalDeleteBeneficiaryComponent,
        ModalAddComponent,
        ModalAddBeneficiaryComponent,
        ModalEditComponent,
        ModalAssignComponent,
        ModalDetailsComponent,
        ModalLanguageComponent,
        BoxSettingComponent,
        BoxPropertiesComponent,
        DisplayFieldComponent,
        HintErrorComponent,
        AdmFormComponent,
        DataValidationComponent,
        DistributionsComponent,
        MobileMoneyComponent,
        GeneralReliefComponent,
        QrVoucherComponent,
        ImportDistributionComponent,
        PlaceholderSummaryComponent,
        PlaceholderBoxlineComponent,
        PlaceholderPanelComponent,
        PlaceholderStepperComponent,
        UpdateBeneficiaryComponent,
        BeneficiaryFormComponent,
        LocationFormComponent,
        ImportedDataComponent,
        ThousandsPipe,
        FormatCamelCasePipe,
        UppercaseFirstPipe,
        ValidatedDistributionComponent,
        NotValidatedDistributionComponent,
        GeneralReliefComponent,
        MobileMoneyComponent,
        QrVoucherComponent,
        VouchersComponent,
        ScannerComponent,
        SettingsComponent,
        AdministrationComponent,
        SsoComponent,
        JsonFormComponent
    ],
    entryComponents: [
        ModalDeleteComponent,
        ModalDeleteBeneficiaryComponent,
        ModalEditComponent,
        ModalDetailsComponent,
        ModalLanguageComponent,
        ModalAddComponent,
        ModalAddBeneficiaryComponent,
        ModalAddCriteriaComponent,
        ModalAddCommodityComponent,
        ModalAssignComponent,
        ModalConfirmationComponent,
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
        GeneralSettingsComponent,
        IconSvgComponent,
        BoxDashboardComponent,
        BoxPropertiesComponent,
        DisplayFieldComponent,
        DatePickerComponent,
        MonthPickerComponent,
        YearPickerComponent,
        HintErrorComponent,
        AdmFormComponent,
        TableComponent,
        TableMobileComponent,
        TableMobileServerComponent,
        TableServerComponent,
        ModalAddCriteriaComponent,
        ModalAddCommodityComponent,
        ModalDeleteComponent,
        ModalDeleteBeneficiaryComponent,
        ModalDetailsComponent,
        ModalLanguageComponent,
        ModalAddComponent,
        ModalAddBeneficiaryComponent,
        ModalAssignComponent,
        BoxSettingComponent,
        MatCheckboxModule,
        MatTooltipModule,
        MatSelectModule,
        MatTableModule,
        MatOptionModule,
        MatButtonModule,
        MatRippleModule,
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
        SettingsComponent,
        AdministrationComponent,
        JsonFormComponent,
        UppercaseFirstPipe,
        SsoComponent
    ],
    providers: [
        { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check' },
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: { siteKey: '6LeFcasUAAAAAAAoPCzr6-GPZP-K2xKtO4BXjMtE'} as RecaptchaSettings,
        },
    ]
})
export class SharedModule { }
