import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LanguageResolver } from 'src/app/core/resolvers/language.resolver';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';
// Services
import { AuthGuard } from './core/guards/auth.guard';
import { DeactivateGuard } from './core/guards/deactivate.guard';
import { PermissionsGuard } from './core/guards/permissions.guard';
import { BeneficiariesImportComponent } from './modules/beneficiary/beneficiaries-import/beneficiaries-import.component';
import { ImportedDataComponent } from './modules/beneficiary/beneficiaries-import/imported-data/imported-data.component';
import { BeneficiariesComponent } from './modules/beneficiary/beneficiaries.component';
import { DataValidationComponent } from './modules/beneficiary/data-validation/data-validation.component';
import { UpdateBeneficiaryComponent } from './modules/beneficiary/update-beneficiary/update-beneficiary.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { AddDistributionComponent } from './modules/projects/add-distribution/add-distribution.component';
import { DistributionsComponent } from './modules/projects/distributions/distributions.component';
import { ProjectComponent } from './modules/projects/project.component';
// Components
import { LoginComponent } from './modules/public/login.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { VouchersComponent } from './modules/vouchers/vouchers.component';


// Do not change the order of the routes, it matters
export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        resolve: { language: LanguageResolver}
    },
    {
        path: 'projects',
        component: ProjectComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver}
    },
    {
        path: 'projects/add-distribution',
        component: AddDistributionComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver}
    },
    {
        path: 'projects/distributions/:id',
        component: DistributionsComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'beneficiaries',
        component: BeneficiariesComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'beneficiaries/import',
        component: BeneficiariesImportComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'beneficiaries/imported',
        component: ImportedDataComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'beneficiaries/import/data-validation',
        component: DataValidationComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'beneficiaries/add-beneficiaries',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },
    {
        path: 'beneficiaries/update-beneficiary/:id',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },

    {
        path: 'vouchers',
        component: VouchersComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },

    // home route protected by auth guard
    {
        path: '', component: DashboardComponent,
        canActivate: [AuthGuard, PermissionsGuard],
        resolve: { language: LanguageResolver},
    },

    // otherwise redirect to home
    {
        path: '**',
        component: NotFoundComponent,
        canActivate: [AuthGuard],
        resolve: { language: LanguageResolver},
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
