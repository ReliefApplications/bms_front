import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog                                          } from '@angular/material';

import { GlobalText                                         } from '../../../../texts/global';

import { ModalLanguageComponent                             } from '../../../components/modals/modal-language/modal-language.component';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {

  public header = GlobalText.TEXTS;
  public language = "en";

  @Input() currentComponent;
  @Input() currentRoute = "";
  @Output() emitLogOut = new EventEmitter();
  @Output() emitCurrentRoute = new EventEmitter<string>();
  @Output() emitToggle = new EventEmitter();

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  logOut(): void {
    this.emitLogOut.emit();
  }

  setCurrentRoute(route: string) {
    this.emitCurrentRoute.emit(route);
  }

  toggle() {
    this.emitToggle.emit();
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
      console.log('The dialog was closed');
    });
  }

}
