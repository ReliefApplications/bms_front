import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ModalRequestsComponent } from 'src/app/components/modals/modal-requests/modal-requests.component';
import { NetworkService } from 'src/app/core/network/network.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { StoredRequest } from 'src/app/models/interfaces/stored-request';

@Component({
    selector: 'app-request-display',
    templateUrl: './request-display.component.html',
    styleUrls: ['./request-display.component.scss']
})
export class RequestDisplayComponent implements OnInit {

    public networkOn = true;
    public storedRequests: StoredRequest[];

    constructor(
        private cacheService: AsyncacheService,
        private networkService: NetworkService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.networkService.getOnlineObs().subscribe(
            status => {
                this.networkOn = status;
                if (status) {
                    this.loadStoredRequests();
                }
            }
        );
    }

    openDialog() {
        const ref = this.dialog.open(
            ModalRequestsComponent,
            {
                data: { requests: this.storedRequests }
            }
        );
        ref.afterClosed().subscribe(() => {
            this.loadStoredRequests();
        });
    }

    loadStoredRequests() {
        this.cacheService.get(AsyncacheService.PENDING_REQUESTS).subscribe(
            (result) => {
                this.storedRequests = result;
            }
        );
    }

    requestsPending(): boolean {
        return (this.storedRequests && this.storedRequests.length > 0);
    }
}
