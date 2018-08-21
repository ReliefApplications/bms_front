import { Component, OnInit, HostListener } from '@angular/core';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { CacheService } from '../../core/storage/cache.service';
import { Households } from '../../model/households';
import { HouseholdsService } from '../../core/api/households.service';
import { GlobalText } from '../../../texts/global';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/FileSaver';
import { ExportInterface } from '../../model/export.interface';

@Component({
  selector: 'app-households',
  templateUrl: './households.component.html',
  styleUrls: ['./households.component.scss']
})
export class HouseholdsComponent implements OnInit {
  public household = GlobalText.TEXTS;
	public nameComponent = "households_title";

  public referedClassService;
  referedClassToken = Households;
  households : MatTableDataSource<Households>;

  constructor(
    private cacheService: CacheService,
    public householdsService: HouseholdsService,
    private router: Router,
    public snackBar: MatSnackBar
  ) { }

  //For windows size
  public maxHeight = 700;
  public maxWidthMobile = 750;
  public maxWidthFirstRow = 1000;
  public maxWidthSecondRow = 800;
  public maxWidth = 750;
  public heightScreen;
  public widthScreen;

  ngOnInit() {
    this.checkSize();
    this.checkHouseholds();
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.household != GlobalText.TEXTS) {
      this.household = GlobalText.TEXTS;
    }
  }

  /**
   * Get list of all households and display it
   */
  checkHouseholds(): void{
    this.referedClassService = this.householdsService;
    this.referedClassService.get().subscribe( response => {
      response = this.referedClassToken.formatArray(response.json());
      this.households = new MatTableDataSource(response);
      this.cacheService.set('HOUSEHOLDS', response);
    })
  }

  /**
   * Listener and function use in case where windows is resize
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void{
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  addOneHousehold(){
    this.router.navigate(['/households/add-household']);
  }

  /**
   * to export household data
   * CSV exported as the same format of csv template download for import
   */
  export() {
    this.householdsService.export().toPromise()
      .then(response => {
        let arrExport = [];
        const reponse: ExportInterface = response.json() as ExportInterface;

        if (!(reponse instanceof Object)) {
          this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: "right"});
        } else {
          arrExport.push(reponse.content);
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, reponse.filename);
        }
      })
      .catch(error => {
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: "right"});
      });
  }


}
