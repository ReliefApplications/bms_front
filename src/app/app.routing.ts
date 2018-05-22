import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './modules/public/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';

// Services
import { AuthGuard } from './core/guards/auth.guard';

// Do not change the order of the routes, it matters
export const routes: Routes = [
	{ path: 'login', component: LoginComponent },

	// home route protected by auth guard
	{ path: '', component: DashboardComponent, canActivate: [AuthGuard] },

	// otherwise redirect to home
	{ path: '**', component: NotFoundComponent }

];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})


export class AppRouting { }
