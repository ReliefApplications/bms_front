import { Component, OnInit } from '@angular/core';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { NetworkService } from 'src/app/core/api/network.service';
import { ModalRequestsComponent } from 'src/app/components/modals/modal-requests/modal-requests.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-request-display',
    templateUrl: './request-display.component.html',
    styleUrls: ['./request-display.component.scss']
})
export class RequestDisplayComponent implements OnInit {

    public networkOn = true;
    public storedRequests = [];

    constructor(
        private cacheService: AsyncacheService,
        private networkService: NetworkService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.loadStoredRequests();

        this.networkService.getOnlineObs().subscribe(
            status => {
                if(status !== this.networkOn) {
                    this.networkOn = status;
                    if(status === true) {
                        this.loadStoredRequests();
                    }
                }
            }
        )
    }

    openDialog() {
        this.dialog.open(ModalRequestsComponent, {data : {requests: this.storedRequests} });
    }

    loadStoredRequests() {
        this.cacheService.get(AsyncacheService.PENDING_REQUESTS).subscribe(
            result => {
                this.storedRequests = result;
                console.log('Cached: ', result);
            }
        )
    }

    requestsArePending() : boolean {
        if(this.networkOn && this.storedRequests) {
            if(this.storedRequests['PUT'] && this.storedRequests['PUT'].length > 0) {
                return true;
            } else if(this.storedRequests['POST'] && this.storedRequests['POST'].length > 0) {
                return true;
            } else if(this.storedRequests['DELETE'] && this.storedRequests['DELETE'].length > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
