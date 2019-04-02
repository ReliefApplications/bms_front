import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
<<<<<<< HEAD
=======
>>>>>>> dev



// Do not change the order of the routes, it matters
export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'projects',
        component: ProjectComponent,
        canActivate: [AuthGuard, PermissionsGuard]
    },
    {
        path: 'projects/add-distribution',
        component: AddDistributionComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'projects/distributions/:id',
        component: DistributionsComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'beneficiaries',
        component: BeneficiariesComponent,
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'beneficiaries/import',
        component: BeneficiariesImportComponent,
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'beneficiaries/imported',
        component: ImportedDataComponent,
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'beneficiaries/import/data-validation',
        component: DataValidationComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'beneficiaries/add-beneficiaries',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard],
    },
    {
        path: 'beneficiaries/update-beneficiary/:id',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard, PermissionsGuard]
    },

    // {
    //     path: 'vouchers',
    //     component: VouchersComponent
    //     canActivate: [AuthGuard, PermissionsGuard],
        // },

    // home route protected by auth guard
    { path: '', component: DashboardComponent, canActivate: [AuthGuard, PermissionsGuard] },

    // otherwise redirect to home
    {
        path: '**',
        component: NotFoundComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    providers: [
        DeactivateGuard
    ],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})


export class AppRouting { }
