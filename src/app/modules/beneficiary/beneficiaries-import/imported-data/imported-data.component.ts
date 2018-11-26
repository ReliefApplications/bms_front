import { Component, OnInit, HostListener } from '@angular/core';
import { HouseholdsService } from 'src/app/core/api/households.service';
import { Households } from 'src/app/model/households';
import { ImportedDataService } from 'src/app/core/utils/imported-data.service';
import { MatTableDataSource } from '@angular/material';
import { GlobalText } from 'src/texts/global';
import { Router } from '@angular/router';

@Component({
  selector: 'app-imported-data',
  templateUrl: './imported-data.component.html',
  styleUrls: ['./imported-data.component.scss']
})
export class ImportedDataComponent implements OnInit {

  public household = GlobalText.TEXTS;
  public newHouseholds: any;
  public data: any;
  public referedClassToken = Households;
  public referedClassService = this._householdsService;
  public loadingTable: boolean = true;

  // For windows size
  public maxHeight = 700;
  public maxWidthMobile = 750;
  public maxWidthFirstRow = 1000;
  public maxWidthSecondRow = 800;
  public maxWidth = 750;
  public heightScreen;
  public widthScreen;

  constructor(
    private _householdsService: HouseholdsService,
    private importedDataService: ImportedDataService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.checkSize();

    this.newHouseholds = this.importedDataService.data;
    this.importedHouseholds();
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

  //Get imported households
  importedHouseholds() {
    this._householdsService.getImported(this.newHouseholds)
      .subscribe(
        response => {
          this.newHouseholds = response;
          this.newHouseholds = Households.formatArray(this.newHouseholds);
          this.data = new MatTableDataSource(this.newHouseholds);
          this.loadingTable = false;
        }
      );
  }

  goBeneficiaries() {
    this.router.navigate(['/beneficiaries']);
  }
}
