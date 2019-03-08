import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { VouchersComponent } from '../vouchers.component';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent extends VouchersComponent implements OnInit {
  @Output() public result = new EventEmitter<string>();

  @ViewChild('scanner')
  public scanner: ZXingScannerComponent;

  public hasDevices = true;
  public hasPermission = true;
  public qrResultString: string;

  public availableDevices: MediaDeviceInfo[] = [];
  public currentDevice: MediaDeviceInfo;
  public selected = 'default';

  ngOnInit(): void {

    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.hasDevices = true;
      this.availableDevices = devices;

      if (devices.length === 1) {
        this.onDeviceSelectChange(devices[0].deviceId);
      }
    });

    this.scanner.camerasNotFound.subscribe(() => this.hasDevices = false);
    this.scanner.permissionResponse.subscribe((perm: boolean) => this.hasPermission = perm);
  }

  handleQrCodeResult(resultString: string) {
    this.scanner.scannerEnabled = false;
    this.result.emit(resultString);
  }

  onDeviceSelectChange(selectedValue: string) {
    this.currentDevice = this.scanner.getDeviceById(selectedValue);
  }

  // DO NOT REMOVE
  log(event) {
    // tslint:disable-next-line
    console.log(event);
  }
}
