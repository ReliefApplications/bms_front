import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

export interface DesactivationGuarded {
    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
    providedIn: 'root'
  })
export class DeactivateGuard implements CanDeactivate<DesactivationGuarded> {

    constructor(
        private dialog: MatDialog,
    ) {}

    canDeactivate(
        component: DesactivationGuarded,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
        ): Observable<boolean> | Promise<boolean> | boolean {

        return component.canDeactivate ? component.canDeactivate() : true;
    }

    // openConfirmDialog() {

    //     let leaveChoice: Promise<boolean> = null;

    //     const confirmation = this.dialog.open(ModalConfirmationComponent, {});
    //     confirmation.afterClosed().subscribe(
    //             choice => {
    //             this.dialog.closeAll();
    //             leaveChoice = new Promise<boolean>(choice);
    //             }
    //         );
    //         return(leaveChoice);
    // }

}
