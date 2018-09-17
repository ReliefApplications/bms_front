import { Component, OnInit, Input, Output, EventEmitter     } from '@angular/core';
import { ActivatedRoute                                     } from '@angular/router';
import { MatDialog                                          } from '@angular/material';

import { GlobalText                                         } from '../../../../texts/global';

import { ModalLanguageComponent                             } from '../../../components/modals/modal-language/modal-language.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public header = GlobalText.TEXTS;
  public language = "en";

  @Input() currentComponent;
  @Input() currentRoute = "";
  @Output() emitLogOut = new EventEmitter();
  public oldRoute = "";
  public oldComponent;
  public routeParsed: Array<string> = [this.header.header_home];
  public routeNameParsed: Array<string[]> = [[this.header.header_home, "Home"]];

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  /**
  * check if the current page has changed
  * and update the new path displayed in the header
  * and check if the langage has changed
  */
  ngDoCheck() {
    if (this.currentComponent != this.oldComponent) {
      this.createRoute(this.currentComponent);
      this.oldComponent = this.currentComponent;
    }
    if (this.header != GlobalText.TEXTS) {
      this.header = GlobalText.TEXTS;
      this.createRoute(this.currentComponent);
    }
  }

  /**
   * get the name of the current in the right language
   * using the key 'currentComponent'
   * @param currentComponent
   */
  createRoute(currentComponent): void {
    this.routeNameParsed = [];
    this.routeParsed = this.currentRoute.split('/');
    this.routeNameParsed.push([this.header.header_home, this.header.header_home]);
    if (this.currentComponent in GlobalText.TEXTS) {
      this.routeNameParsed.push([GlobalText.TEXTS[this.currentComponent], this.routeParsed[1]]);
    }
  }

  logOut(): void {
    this.emitLogOut.emit();
  }

  /**
  * open each modal dialog
  */
  openDialog(user_action): void {
    let dialogRef;

    if (user_action == 'language') {
      dialogRef = this.dialog.open(ModalLanguageComponent, {
      });
    }

    dialogRef.afterClosed().subscribe(result => {
      this.language = GlobalText.language;
      // console.log('The dialog was closed');
    });
  }
}
