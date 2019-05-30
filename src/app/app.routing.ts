import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LanguageResolver } from 'src/app/core/resolvers/language.resolver';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';
// Services
import { AuthGuard } from './core/guards/auth.guard';
import { DeactivateGuard } from './core/guards/deactivate.guard';
import { LogoutGuard } from './core/guards/logout.guard';
import { PermissionsGuard } from './core/guards/permissions.guard';
import { CountryResolver } from './core/resolvers/countries.resolver';
import { BeneficiariesImportComponent } from './modules/beneficiaries/beneficiaries-import/beneficiaries-import.component';
import { ImportedDataComponent } from './modules/beneficiaries/beneficiaries-import/imported-data/imported-data.component';
import { BeneficiariesComponent } from './modules/beneficiaries/beneficiaries.component';
import { DataValidationComponent } from './modules/beneficiaries/data-validation/data-validation.component';
import { UpdateBeneficiaryComponent } from './modules/beneficiaries/update-beneficiary/update-beneficiary.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { AddDistributionComponent } from './modules/projects/add-distribution/add-distribution.component';
import { DistributionsComponent } from './modules/projects/distributions/distributions.component';
import { ProjectComponent } from './modules/projects/project.component';
// Components
import { LoginComponent } from './modules/public/login.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { GeneralSettingsComponent } from './modules/general-settings/general-settings.component';
import { VouchersComponent } from './modules/vouchers/vouchers.component';
import { AdministrativeSettingsComponent } from './modules/administrative-settings/administrative-settings.component';


// Do not change the order of the routes, it matters
export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LogoutGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'projects',
        component: ProjectComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver}
    },
    {
        path: 'projects/add-distribution',
        component: AddDistributionComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver}
    },
    {
        path: 'projects/distributions/:id',
        component: DistributionsComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'beneficiaries',
        component: BeneficiariesComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'settings',
        component: GeneralSettingsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'beneficiaries/import',
        component: BeneficiariesImportComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'beneficiaries/imported',
        component: ImportedDataComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'beneficiaries/import/data-validation',
        component: DataValidationComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'beneficiaries/add-beneficiaries',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'beneficiaries/update-beneficiary/:id',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },

    {
        path: 'vouchers',
        component: VouchersComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
    {
        path: 'admin',
        component: AdministrativeSettingsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },

    // home route protected by auth guard
    {
        path: '', component: DashboardComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },

    // otherwise redirect to home
    {
        path: '**',
        component: NotFoundComponent,
        canActivate: [AuthGuard],
        resolve: {language: LanguageResolver, country: CountryResolver},
    },
];

@NgModule({
    providers: [
        DeactivateGuard,
        LanguageResolver,
    ],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})


export class AppRouting { }
