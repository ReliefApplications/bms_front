import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpService } from '../network/http.service';
import { LanguageService } from 'src/app/core/language/language.service';

@Injectable({
    providedIn: 'root'
})
export class ExportService {
    readonly api = URL_BMS_API;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private http: HttpService,
        private snackbar: SnackbarService,
        protected languageService: LanguageService,
    ) {
    }

    /**
     * Export data
     * @param  key           key to define data to export (e.g. distributions)
     * @param  value         value to define data to export (e.g. projet_id)
     * @param  extensionType extension of the file
     * @param filters        the filters to apply to the data
     * @return               file to export
     */
    public export(key: string, value: any, extensionType: string, body = null, filters: any = null, ids: Array<string> = []) {

        const params = {};
        params['type'] = extensionType;
        params[key] = value;
        const options = {
            responseType: 'blob',
            params: params
        };
        const url = this.api + '/export';
        if (filters) {
            body['filters'] = filters;
        }
        if (ids && ids.length > 0) {
            body['ids'] = ids;
        }
        return this.http.post(url, body, options).pipe(
            tap(response => {
                if (! response) {
                    this.snackbar.warning(this.language.snackbar_no_data_export);
                }
                saveAs(response, key + '.' + extensionType);
            }),
        );
    }

    public printVoucher(id: number, code: string) {
        return this.http.get(this.api + '/booklets/print/' + id, {responseType: 'blob'}).pipe(
            tap(response => {
                const blob = new Blob([response], {type: ('blob')});
                const filename = 'Booklet-' + code + '.pdf';
                saveAs(blob, filename);
            })
        );
    }

    public printManyVouchers(bookletIds: number[]) {
        const body = {
            bookletIds: bookletIds
        };
        return this.http.post(this.api + '/booklets-print', body, {responseType: 'blob'}).pipe(
            tap(response => {
                const blob = new Blob([response], {type: ('blob')});
                const filename = 'Booklets.pdf';
                saveAs(blob, filename);
            })
        );
    }

    public printInvoice(vendorId: number) {
        return this.http.get(this.api + '/invoice-print/' + vendorId, {responseType: 'blob'}).pipe(
            tap((response: Blob) => {
                const blob = new Blob([response], {type: ('blob')});
                const filename = 'Invoice-' + vendorId + '.pdf';
                saveAs(blob, filename);
            })
        );
    }

    public printOrganizationTemplate() {
        return this.http.get(this.api + '/organization/print/template', {responseType: 'blob'}).pipe(
            tap((response: any) => {
                const blob = new Blob([response], {type: ('blob')});
                const filename = 'Pdf-template.pdf';
                saveAs(blob, filename);
            })
        );
    }
}
