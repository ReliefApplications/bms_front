import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent 																} from './modules/public/login.component';
import { DashboardComponent 															} from './modules/dashboard/dashboard.component';
import { NotFoundComponent 																} from './components/error-pages/not-found/not-found.component';
import { DistributionComponent 															} from './modules/distributions/distributions.component';
import { AddDistributionComponent 														} from './modules/distributions/add-distribution/add-distribution.component';
import { SettingsComponent 																} from './modules/settings/settings.component';
import { HouseholdsComponent 															} from './modules/households/households.component';
import { HouseholdsImportComponent 														} from './modules/households/households-import/households-import.component';
import { ReportsComponent 																} from './modules/reports/reports.component';
import { ProfileComponent																	} from './modules/profile/profile.component';
import { AddHouseholdComponent 															} from './modules/households/add-household/addHousehold.component';
import { DataValidationComponent 														} from './modules/households/data-validation/data-validation.component';

// Services
import { AuthGuard 																		} from './core/guards/auth.guard';

// Do not change the order of the routes, it matters
export const routes: Routes = [
	{ path: 'login', component: LoginComponent },

	{ path: 'distribution', component: DistributionComponent },

	{ path: 'distribution/add-distribution', component: AddDistributionComponent },

	{ path: 'households', component: HouseholdsComponent },

	{ path: 'reports', component: ReportsComponent },

	{ path: 'settings', component: SettingsComponent },

	{ path: 'profile', component: ProfileComponent },

	{ path: 'households/import', component: HouseholdsImportComponent },

	{ path: 'households/data-validation', component: DataValidationComponent },

	{ path: 'households/add-household', component: AddHouseholdComponent },

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
