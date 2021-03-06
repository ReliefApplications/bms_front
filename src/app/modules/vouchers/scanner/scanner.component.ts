import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { VouchersComponent } from '../vouchers.component';

@Component({
    selector: 'app-scanner',
    templateUrl: './scanner.component.html',
    styleUrls: [ './scanner.component.scss' ]
})
export class ScannerComponent extends VouchersComponent implements OnInit {
    @Output() public result = new EventEmitter<string>();

    @ViewChild('scanner', { static: true }) public scanner: ZXingScannerComponent;

    public hasDevices = true;
    public hasPermission = true;
    public qrResultString: string;

    public availableDevices: MediaDeviceInfo[] = [];
    public currentDevice: MediaDeviceInfo;
    public selectedDeviceControl = new FormControl();
    public selected = 'default';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    ngOnInit(): void {
        this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
            this.hasDevices = true;
            this.availableDevices = devices;

            if (this.availableDevices.length >= 1) {
                this.selectedDeviceControl.setValue(this.availableDevices[0].deviceId);
            }
        });

        this.selectedDeviceControl.valueChanges.subscribe((deviceId: string) => {
            this.currentDevice = this.scanner.getDeviceById(deviceId);
        });

        this.scanner.camerasNotFound.subscribe(() => (this.hasDevices = false));
        this.scanner.permissionResponse.subscribe((perm: boolean) => (this.hasPermission = perm));
    }

    handleQrCodeResult(resultString: string) {
        this.scanner.scannerEnabled = false;
        this.result.emit(resultString);
    }

    /**
   * To cancel on a dialog
   */
    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }

    // DO NOT REMOVE
    log(event: any) {
        // tslint:disable-next-line
        console.log(event);
    }
}
