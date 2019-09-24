import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ImportService } from 'src/app/core/api/beneficiaries-import.service';
import { Household } from 'src/app/models/household';
import { DisplayType } from 'src/app/models/constants/screen-sizes';

@Component({
    selector: 'app-imported-data',
    templateUrl: './imported-data.component.html',
    styleUrls: ['./imported-data.component.scss']
})
export class ImportedDataComponent implements OnInit, OnDestroy {

    public data: MatTableDataSource<Household>;
    public referedClassToken = Household;
    public referedClassService = this._householdsService;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private _householdsService: HouseholdsService,
        private importService: ImportService,
        private router: Router,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
    ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        const newHouseholds = this.importService.importedHouseholds;
        this.data = new MatTableDataSource(newHouseholds);
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
    }

    goBeneficiaries()  {
        this.router.navigate(['/beneficiaries']);
    }

    goProject() {
        this.router.navigate(['/projects']);
    }
}
