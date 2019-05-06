import { Component, HostListener, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { ImportService } from 'src/app/core/utils/beneficiaries-import.service';
import { Household } from 'src/app/model/household';

@Component({
    selector: 'app-imported-data',
    templateUrl: './imported-data.component.html',
    styleUrls: ['./imported-data.component.scss']
})
export class ImportedDataComponent implements OnInit {

    public data: MatTableDataSource<Household>;
    public referedClassToken = Household;
    public referedClassService = this._householdsService;
    public loadingTable = true;

    // For windows size
    public maxHeight = 700;
    public maxWidthMobile = 750;
    public maxWidthFirstRow = 1000;
    public maxWidthSecondRow = 800;
    public maxWidth = 750;
    public heightScreen;
    public widthScreen;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private _householdsService: HouseholdsService,
        private importService: ImportService,
        private router: Router,
        public languageService: LanguageService,
    ) { }

    ngOnInit() {
        this.checkSize();
        const newHouseholds = this.importService.importedHouseholds;
        this.data = new MatTableDataSource(newHouseholds);
        this.loadingTable = false;
    }


    /**
  	 * Listener and function use in case where windows is resize
  	 * @param event
  	 */
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    goBeneficiaries()  {
        this.router.navigate(['/beneficiaries']);
    }

    goProject() {
        this.router.navigate(['/projects']);
    }
}
