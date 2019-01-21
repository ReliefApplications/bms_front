import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../texts/global';
import { MatTableDataSource } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { Booklet } from 'src/app/model/booklet';
import { BookletService } from 'src/app/core/api/booklet.service';

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit {

  public maxHeight = GlobalText.maxHeight;
  public maxWidthMobile = GlobalText.maxWidthMobile;
  public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
  public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
  public maxWidth = GlobalText.maxWidth;
  public heightScreen;
  public widthScreen;

  public nameComponent = 'vouchers';
  public voucher = GlobalText.TEXTS;
  public language = GlobalText.language;

  public bookletClass = Booklet;

  public loadingBooklet: boolean = true;
  public loadingExport: boolean = false;
  public load: boolean = false;

  public booklets: Booklet[];
  public bookletData: MatTableDataSource<Booklet>;
  public extensionType: string;


  constructor(
    public bookletService: BookletService
  ) { }

  ngOnInit() {
    this.checkSize();
    this.extensionType = 'xls';

    this.getBooklets();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  getBooklets() {
    // this.voucherService.get().pipe(
    //   finalize(
    //     () => {
    //       this.loadingVouchers = false;
    //     },
    //   )
    // ).subscribe(
    //   response => {
    //     if (response && response.length > 0) {
    //       this.vouchers = this.voucherClass.formatArray(response).reverse();
    //       this.voucherData = new MatTableDataSource(this.vouchers);
    //     } else if (response === null) {
    //       this.vouchers = null;
    //     }
    //   }
    // );

    const booklet = {
      code: 'code',
      number_vouchers: 10,
      individual_value: 50,
      currency: 'USD',
      status: 1,
      password: 'test33TEST',
      distribution_beneficiary: 1
    }
    this.booklets = [];
    this.booklets.push(new Booklet(booklet));
    this.bookletData = new MatTableDataSource(this.booklets);
    this.loadingBooklet = false;
  }
}
