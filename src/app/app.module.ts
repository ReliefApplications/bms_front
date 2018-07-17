import { NgModule 																} from '@angular/core';
import { BrowserModule 															} from '@angular/platform-browser';
import { FormsModule 															} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS 									} from '@angular/common/http';
import { HttpModule 															} from '@angular/http';

import { AuthInterceptor 														} from './core/interceptors/auth-interceptor';

import { AppComponent 															} from './app.component';
import { DashboardComponent 													} from './modules/dashboard/dashboard.component';
import { ForbiddenComponent 													} from './components/error-pages/forbidden/forbidden.component';
import { NotFoundComponent 														} from './components/error-pages/not-found/not-found.component';
import { LoginComponent 														} from './modules/public/login.component';

import { AppRouting 															} from './app.routing';
import { SharedModule 															} from './shared/shared.module';

import { ReportsModule										 					} from './modules/reports/reports.module';
import { ModalAddComponent } from './components/modals/modal-add/modal-add.component';

@NgModule({
	declarations: [
		AppComponent,
		ForbiddenComponent,
		NotFoundComponent,
		ModalAddComponent,
	],
	imports: [
		// Modules
		BrowserModule,
		FormsModule,
		HttpClientModule,
		SharedModule,
		HttpModule,

		// Reporting
		ReportsModule,
		
		// Routing
		AppRouting
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
