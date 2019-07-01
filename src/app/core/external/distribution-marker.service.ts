import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as Leaflet from 'leaflet';
import { Commodity } from 'src/app/models/commodity';
import { Distribution } from 'src/app/models/distribution';
import { DistributionBeneficiary } from 'src/app/models/distribution-beneficiary';


@Injectable({
  providedIn: 'root'
})
export class DistributionMarkerService {
    datePipe = new DatePipe('en-US');
    public getClassesNames(distribution: Distribution) {
        return this.getDistributionStatus(distribution);
    }

    private getDistributionStatus(distribution: Distribution) {
        if (!distribution.get<boolean>('validated')) {
            return 'not-validated';
        }
        if (distribution.get<boolean>('finished')) {
            return 'completed';
        }
        return 'validated';
    }

    public isToday(distribution: Distribution) {
        const today = new Date();
        const distributionDate = distribution.get<Date>('date');
        today.setHours(0, 0, 0, 0);
        distributionDate.setHours(0, 0, 0, 0);
        return (distributionDate.getTime() === today.getTime());
    }

    public getImage(distribution: Distribution) {
        return distribution.get<Array<Commodity>>('commodities')[0].getImage();
    }

    public getPopup(distribution: Distribution) {
        const popup = Leaflet.DomUtil.create('div', 'infoWindow');
        popup.innerHTML = `
            <div id="bms-popup">
                ${this.formatPropertyIfExists('Adm1', distribution.get(['location', 'adm1', 'name']))}
                ${this.formatPropertyIfExists('Adm2', distribution.get(['location', 'adm2', 'name']))}
                ${this.formatPropertyIfExists('Adm3', distribution.get(['location', 'adm3', 'name']))}
                ${this.formatPropertyIfExists('Adm4', distribution.get(['location', 'adm4', 'name']))}
                ${this.formatPropertyIfExists('Name', distribution.get(['location', 'adm4', 'name']))}
                ${this.formatPropertyIfExists('Beneficiaries count',
                    distribution.get<Array<DistributionBeneficiary>>('distributionBeneficiaries').length.toString())}
                ${this.formatPropertyIfExists('Name', distribution.get('name'))}
                ${this.formatPropertyIfExists('Modality', distribution.get<Array<Commodity>>('commodities')
                    .map((commodity: Commodity) => commodity.get<string>(['modalityType', 'name']))
                    .reduce((previousValue: string, currentValue: string) => `${previousValue}, ${currentValue}`))}
                ${this.formatPropertyIfExists('Date', this.datePipe.transform(distribution.get<Date>('date'), 'dd-MM-yyyy'))}
            </div>
        `;
        return popup;
    }

    private formatPropertyIfExists(name: string, property: string) {
        return property ? `<p>${name}: ${property}</p>` : '';
    }
}
