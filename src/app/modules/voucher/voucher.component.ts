import { Component, OnInit } from '@angular/core';
import { ExportService } from '../../core/api/export.service';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements OnInit {

  constructor(private _exportService : ExportService) { 
  }

  ngOnInit() {
  }

  test() {
		return this._exportService.test()
  }
  
  printAll() {
    return this._exportService.printAll()
  }

}
