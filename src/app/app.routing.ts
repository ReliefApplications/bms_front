import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';
// Services
import { AuthGuard } from './core/guards/auth.guard';
import { DeactivateGuard } from './core/guards/deactivate.guard';
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



// Do not change the order of the routes, it matters
export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'projects',
        component: ProjectComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'projects/add-distribution',
        component: AddDistributionComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard],
    },
    {
        path: 'projects/distributions/:id',
        component: DistributionsComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries',
        component: BeneficiariesComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries/import',
        component: BeneficiariesImportComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries/imported',
        component: ImportedDataComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries/import/data-validation',
        component: DataValidationComponent,
        canDeactivate: [DeactivateGuard],
        canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries/add-beneficiaries',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard],
    },
    {
        path: 'beneficiaries/update-beneficiary/:id',
        component: UpdateBeneficiaryComponent ,
        canDeactivate : [DeactivateGuard],
        canActivate: [AuthGuard],
    },

    // {
    //     path: 'vouchers',
    //     component: VouchersComponent
    //     canActivate: [AuthGuard],
        // },

    // home route protected by auth guard
    {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
    },

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
