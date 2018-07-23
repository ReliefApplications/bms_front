import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';

import { GlobalText } from '../../../../texts/global';

import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';

@Component({
  selector: 'app-header-menu-top',
  templateUrl: './header-menu-top.component.html',
  styleUrls: ['./header-menu-top.component.scss']
})
export class HeaderMenuTopComponent implements OnInit {
  public header = GlobalText.TEXTS;
  @Output() emitOpenMenu = new EventEmitter<boolean>();
  @Output() emitLogOut = new EventEmitter();

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openTopMenu(): void {
    this.emitOpenMenu.emit(true);
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
      console.log('The dialog was closed');
    });
  }
}
