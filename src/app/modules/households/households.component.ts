import { Component, OnInit, HostListener } from '@angular/core';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { CacheService } from '../../core/storage/cache.service';
import { Households } from '../../model/households';
import { HouseholdsService } from '../../core/api/households.service';
import { GlobalText } from '../../../texts/global';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/FileSaver';

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

  export() {
    this.householdsService.export().toPromise()
      .then(response => {
        let arrExport = [];
        let reponse = response.json();
        if (!(reponse instanceof Array)) {
          this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: "right"});
        } else {
          arrExport.push(response.json()[0]); //0 represente le fichier csv et 1 son nom
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, response.json()[1]);
        }
      })
      .catch(error => {
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: "right"});
      });
  }


}
