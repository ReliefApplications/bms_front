import { NgModule 																} from '@angular/core';
import { BrowserModule 															} from '@angular/platform-browser';
import { FormsModule 															} from '@angular/forms';
import { ReactiveFormsModule                                                    } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS 									} from '@angular/common/http';
import { HttpModule 															} from '@angular/http';

import { httpInterceptorProviders 								} from './core/interceptors/index-interceptors';

import { AppComponent 															} from './app.component';
import { DashboardComponent 													} from './modules/dashboard/dashboard.component';
import { ForbiddenComponent 													} from './components/error-pages/forbidden/forbidden.component';
import { NotFoundComponent 														} from './components/error-pages/not-found/not-found.component';
import { LoginComponent 														} from './modules/public/login.component';

import { AppRouting 															} from './app.routing';
import { SharedModule 															} from './shared/shared.module';

import { ReportsModule										 					} from './modules/reports/reports.module';
import { ProfileComponent } from './modules/profile/profile.component';
import { HeaderMobileComponent } from './components/headers/header-mobile/header-mobile.component';
import { HeaderComponent } from './components/headers/header/header.component';
import { ModalLeaveComponent } from './components/modals/modal-leave/modal-leave.component';
import { DatePipe } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { UpdateService } from './core/api/update.service';
import { ImportedDataService } from './core/utils/imported-data.service';
import { RequestDisplayComponent } from './components/headers/request-display/request-display.component';
import { ModalRequestsComponent } from './components/modals/modal-requests/modal-requests.component';
import { TitleCasePipe } from '@angular/common';

@NgModule({
	declarations: [
		AppComponent,
		ForbiddenComponent,
		NotFoundComponent,
		ProfileComponent,
    	HeaderMobileComponent,
		HeaderComponent,
		ModalLeaveComponent,
		RequestDisplayComponent,
		ModalRequestsComponent,
	],
	imports: [
		// Modules
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		SharedModule,
		HttpModule,

		// Reporting
		ReportsModule,

		// Routing
		AppRouting,
		ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
	],
	providers: [
        DatePipe,
        UpdateService,
        httpInterceptorProviders,
		ImportedDataService,
		TitleCasePipe,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
