import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent 																} from './modules/public/login.component';
import { DashboardComponent 															} from './modules/dashboard/dashboard.component';
import { NotFoundComponent 																} from './components/error-pages/not-found/not-found.component';
import { ProjectComponent 																} from './modules/projects/project.component';
import { AddProjectComponent 															} from './modules/projects/add-project/add-project.component';
import { SettingsComponent 																} from './modules/settings/settings.component';
import { BeneficiariesComponent 														} from './modules/beneficiary/beneficiaries.component';
import { BeneficiariesImportComponent 													} from './modules/beneficiary/beneficiaries-import/beneficiaries-import.component';
import { ReportsComponent 																} from './modules/reports/reports.component';
import { ProfileComponent																} from './modules/profile/profile.component';
import { AddBeneficiaryComponent 														} from './modules/beneficiary/add-beneficiary/addBeneficiary.component';
import { DataValidationComponent 														} from './modules/beneficiary/data-validation/data-validation.component';

// Services
import { AuthGuard 																		} from './core/guards/auth.guard';
import { DistributionsComponent } from './modules/projects/distributions/distributions.component';

// Do not change the order of the routes, it matters
export const routes: Routes = [
	{ path: 'login', component: LoginComponent },

	{ path: 'projects', component: ProjectComponent },

	{ path: 'project/add-project', component: AddProjectComponent },

	{ path: 'distributions/:id', component: DistributionsComponent },

	{ path: 'beneficiaries', component: BeneficiariesComponent },

	{ path: 'reports', component: ReportsComponent },

	{ path: 'settings', component: SettingsComponent },

	{ path: 'profile', component: ProfileComponent },

	{ path: 'beneficiaries/import', component: BeneficiariesImportComponent },

	{ path: 'beneficiaries/data-beneficiaries', component: DataValidationComponent },

	{ path: 'beneficiaries/add-beneficiaries', component: AddBeneficiaryComponent },

	// home route protected by auth guard
	{ path: '', component: DashboardComponent, canActivate: [AuthGuard] },

	// otherwise redirect to home
	{ path: '**', component: NotFoundComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})


export class AppRouting { }
