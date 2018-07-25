import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent 																} from './modules/public/login.component';
import { DashboardComponent 															} from './modules/dashboard/dashboard.component';
import { NotFoundComponent 																} from './components/error-pages/not-found/not-found.component';
import { DistributionComponent 															} from './modules/distribution/distribution.component';
import { AddDistributionComponent 														} from './modules/distribution/add-distribution/add-distribution.component';
import { SettingsComponent 																} from './modules/settings/settings.component';
import { HouseholdsComponent 															} from './modules/households/households.component';
import { HouseholdsImportComponent 														} from './modules/households/households-import/households-import.component';
import { ReportsComponent 																} from './modules/reports/reports.component';

// Services
import { AuthGuard 																		} from './core/guards/auth.guard';
import { DataValidationComponent 														} from './modules/households/data-validation/data-validation.component';

// Do not change the order of the routes, it matters
export const routes: Routes = [
	{ path: 'login', component: LoginComponent },

	{ path: 'distribution', component: DistributionComponent },

	{ path: 'distribution/add-distribution', component: AddDistributionComponent },

	{ path: 'households', component: HouseholdsComponent },

	{ path: 'reports', component: ReportsComponent },

	{ path: 'settings', component: SettingsComponent },

	{ path: 'households/import', component: HouseholdsImportComponent },

	{ path: 'households/data-validation', component: DataValidationComponent },

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
