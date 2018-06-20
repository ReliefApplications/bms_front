import { NgModule 																} from '@angular/core';
import { BrowserModule 															} from '@angular/platform-browser';
import { FormsModule 															} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS 									} from '@angular/common/http';

import { AuthInterceptor 														} from './core/interceptors/auth-interceptor';

import { AppComponent 															} from './app.component';
import { DashboardComponent 													} from './modules/dashboard/dashboard.component';
import { ForbiddenComponent 													} from './components/error-pages/forbidden/forbidden.component';
import { NotFoundComponent 														} from './components/error-pages/not-found/not-found.component';
import { LoginComponent 														} from './modules/public/login.component';

import { AppRouting 															} from './app.routing';
import { SharedModule 															} from './shared/shared.module';

@NgModule({
	declarations: [
		AppComponent,
		ForbiddenComponent,
		NotFoundComponent,
	],
	imports: [
		// Modules
		BrowserModule,
		FormsModule,
		HttpClientModule,
		SharedModule,
		
		// Routing
		AppRouting
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
