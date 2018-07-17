import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';

import { DistributionService } from '../../core/api/distribution.service';
import { CacheService } from '../../core/storage/cache.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { CountrySpecificService } from '../../core/api/country-specific.service';

import { DistributionData } from '../../model/distribution-data';
import { Donor } from '../../model/donor';
import { Project } from '../../model/project';
import { UserInterface } from '../../model/interfaces';
import { CountrySpecific } from '../../model/country-specific';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { Mapper } from '../../core/utils/mapper.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  selectedTitle = "";
  isBoxClicked = false;

  public referedClassService;
  referedClassToken;
  data: MatTableDataSource<any>;
  public user_action: string = '';

  public maxHeight = 700;
  public maxWidthMobile = 750;
  public maxWidthFirstRow = 1000;
  public maxWidthSecondRow = 800;
  public maxWidth = 750;
  public heightScreen;
  public widthScreen;

  constructor(
    public dialog: MatDialog,
    public mapperService: Mapper,
    public distributionService: DistributionService,
    public donorService: DonorService,
    public projectService: ProjectService,
    public userService: UserService,
    public countrySpecificService: CountrySpecificService,
    private cacheService: CacheService,
  ) { }

  ngOnInit() {
    this.checkSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  selectTitle(title): void {
    this.getData(title);
    this.isBoxClicked = true;
    this.selectedTitle = title;
  }

  getData(title) {
    switch (title) {
      case 'users':
        this.referedClassToken = UserInterface;
        this.referedClassService = this.userService;
        break;
      case 'donors':
        this.referedClassToken = Donor;
        this.referedClassService = this.donorService;
        break;
      case 'projects':
        this.referedClassToken = Project;
        this.referedClassService = this.projectService;
        break;
      case 'country specific options':
        this.referedClassToken = CountrySpecific;
        this.referedClassService = this.countrySpecificService;
        break;
      default: break;
    }
    this.load(title);
  }

  load(title): void {
    this.referedClassService.get().subscribe(response => {
      response = this.referedClassToken.formatArray(response.json());
      this.cacheService.set((<typeof CacheService>this.cacheService.constructor)[this.referedClassToken.__classname__.toUpperCase() + "S"], response);
      this.data = new MatTableDataSource(response);
    })
  }

  /**
  * open each modal dialog
  */
  openDialog(user_action): void {
    let dialogRef;

    if (user_action == 'add') {
      dialogRef = this.dialog.open(ModalAddComponent, {
        data: { entity: this.referedClassToken, service: this.referedClassService, mapper: this.mapperService }
      });
    }
    // const update = dialogRef.componentInstance.onUpdate.subscribe((data) => {
    //   this.updateElement(data);
    // });

    dialogRef.afterClosed().subscribe(result => {
      // update.unsubscribe();
      console.log('The dialog was closed');
    });
  }
}
