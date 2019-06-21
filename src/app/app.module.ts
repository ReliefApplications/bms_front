import { DatePipe, TitleCasePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LivechatWidgetModule } from '@livechat/angular-widget';
import { environment } from '../environments/environment';
import { setAppInjector } from './app-injector';
import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';
import { NotFoundComponent } from './components/error-pages/not-found/not-found.component';
import { HeaderMobileComponent } from './components/headers/header-mobile/header-mobile.component';
import { HeaderComponent } from './components/headers/header/header.component';
import { RequestDisplayComponent } from './components/headers/request-display/request-display.component';
import { ModalConfirmationComponent } from './components/modals/modal-confirmation/modal-confirmation.component';
import { ModalRequestsComponent } from './components/modals/modal-requests/modal-requests.component';
import { httpInterceptorProviders } from './core/interceptors/index-interceptors';
import { UpdateService } from './core/service-worker/update.service';
import { ProfileComponent } from './modules/profile/profile.component';
import { ReportsModule } from './modules/reports/reports.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
    declarations: [
        AppComponent,
        NotFoundComponent,
        ProfileComponent,
        HeaderMobileComponent,
        HeaderComponent,
        ModalConfirmationComponent,
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
        LivechatWidgetModule,

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
        TitleCasePipe,
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(injector: Injector) {
        setAppInjector(injector);
    }
}
