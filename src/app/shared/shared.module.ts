import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// tslint:disable-next-line
import { MatBadgeModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDividerModule, MatExpansionModule, MatInputModule, MatListModule, MatNativeDateModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatRadioModule, MatSelectModule, MatSnackBarModule, MatStepperModule, MatTabsModule, MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { RecaptchaModule } from 'angular-google-recaptcha';
import { CountoModule } from 'angular2-counto';
import { FormatCamelCasePipe } from 'src/app/core/utils/formatCamelCase.pipe';
import { ThousandsPipe } from 'src/app/core/utils/thousands.pipe';
import { UppercaseFirstPipe } from 'src/app/core/utils/uppercase-first.pipe';
import { BoxDashboardComponent } from '../components/box/box-dashboard/box-dashboard.component';
import { BoxPropertiesComponent } from '../components/box/box-properties/box-properties.component';
import { BoxSettingComponent } from '../components/box/box-setting/box-setting.component';
import { DisplayFieldComponent } from '../components/common/display-field/display-field.component';
import { DatePickerComponent } from '../components/date-pickers/date-picker/date-picker.component';
import { MonthPickerComponent } from '../components/date-pickers/month-picker/month-picker.component';
import { YearPickerComponent } from '../components/date-pickers/year-picker/year-picker.component';
import { HintErrorComponent } from '../components/hint-error/hint-error.component';
import { IconSvgComponent } from '../components/icon-svg/icon-svg.component';
import { ModalAddCommodityComponent } from '../components/modals/modal-add-commodity/modal-add-commodity.component';
import { ModalAddCriteriaComponent } from '../components/modals/modal-add-criteria/modal-add-criteria.component';
import { ModalAddComponent } from '../components/modals/modal-add/modal-add.component';
import { ModalAssignComponent } from '../components/modals/modal-assign/modal-assign.component';
import { ModalDeleteComponent } from '../components/modals/modal-delete/modal-delete.component';
import { ModalDetailsComponent } from '../components/modals/modal-details/modal-details.component';
import { ModalEditComponent } from '../components/modals/modal-edit/modal-edit.component';
import { ModalFieldsComponent } from '../components/modals/modal-fields/modal-fields.component';
import { ModalLanguageComponent } from '../components/modals/modal-language/modal-language.component';
import { ModalLeaveComponent } from '../components/modals/modal-leave/modal-leave.component';
import { ModalRequestsComponent } from '../components/modals/modal-requests/modal-requests.component';
import { PlaceholderBoxlineComponent } from '../components/placeholders/placeholder-boxline/placeholder-boxline.component';
import { PlaceholderPanelComponent } from '../components/placeholders/placeholder-panel/placeholder-panel.component';
import { PlaceholderStepperComponent } from '../components/placeholders/placeholder-stepper/placeholder-stepper.component';
import { PlaceholderSummaryComponent } from '../components/placeholders/placeholder-summary/placeholder-summary.component';
import { PlaceholderTitleComponent } from '../components/placeholders/placeholder-title/placeholder-title.component';
import { TableMobileServerComponent } from '../components/table/table-mobile-server/table-mobile-server.component';
import { TableMobileComponent } from '../components/table/table-mobile/table-mobile.component';
import { TableServerComponent } from '../components/table/table-server/table-server.component';
import { TableComponent } from '../components/table/table.component';
import { BeneficiariesImportComponent } from '../modules/beneficiary/beneficiaries-import/beneficiaries-import.component';
import { ImportedDataComponent } from '../modules/beneficiary/beneficiaries-import/imported-data/imported-data.component';
import { BeneficiariesComponent } from '../modules/beneficiary/beneficiaries.component';
import { DataValidationComponent } from '../modules/beneficiary/data-validation/data-validation.component';
import { BeneficiaryFormComponent } from '../modules/beneficiary/update-beneficiary/beneficiary-form/beneficiary-form.component';
import { UpdateBeneficiaryComponent } from '../modules/beneficiary/update-beneficiary/update-beneficiary.component';
import { DashboardComponent } from '../modules/dashboard/dashboard.component';
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
import { SettingsComponent } from '../modules/settings/settings.component';
import { ScannerComponent } from '../modules/vouchers/scanner/scanner.component';
import { VouchersComponent } from '../modules/vouchers/vouchers.component';





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
        DatePickerComponent,
        MonthPickerComponent,
        YearPickerComponent,
        ProjectComponent,
        AddDistributionComponent,
        SettingsComponent,
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
        ModalAddComponent,
        ModalEditComponent,
        ModalAssignComponent,
        ModalDetailsComponent,
        ModalLanguageComponent,
        BoxSettingComponent,
        BoxPropertiesComponent,
        DisplayFieldComponent,
        HintErrorComponent,
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
        PlaceholderTitleComponent,
        UpdateBeneficiaryComponent,
        BeneficiaryFormComponent,
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
    ],
    entryComponents: [
        ModalDeleteComponent,
        ModalEditComponent,
        ModalDetailsComponent,
        ModalLanguageComponent,
        ModalAddComponent,
        ModalAddCriteriaComponent,
        ModalAddCommodityComponent,
        ModalAssignComponent,
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
        DisplayFieldComponent,
        DatePickerComponent,
        MonthPickerComponent,
        YearPickerComponent,
        HintErrorComponent,
        TableComponent,
        TableMobileComponent,
        TableMobileServerComponent,
        TableServerComponent,
        ModalAddCriteriaComponent,
        ModalAddCommodityComponent,
        ModalDeleteComponent,
        ModalDetailsComponent,
        ModalLanguageComponent,
        ModalAddComponent,
        ModalAssignComponent,
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
        { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check' },
    ]
})
export class SharedModule { }
