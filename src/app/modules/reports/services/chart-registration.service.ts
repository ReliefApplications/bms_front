import { Injectable } from "@angular/core";
import { ChartInterface } from "../charts/chart/chart.interface";
import { FilterInterface } from "../../../model/filter";



export interface RegisteredItem {
    /**
     * chart id
     */
    chartId: string;
    /**
     * filter id
     */
    filterId: string;
    /**
     * current value in the filter
     */
    currentValue: any;
    /**
     * old value
     */
    oldValue: any;
    /**
     * This key should be used to tell to the chart component how to format the currentvalue before sending it.
     * Look at ChartComponent.ngOnChanges() 
     */
    referenceKey: string;
}

@Injectable({
	providedIn: 'root'
})
export class ChartRegistration {

    /**
     * Table association between a chart and its filters
     */
    static associations: Array<RegisteredItem> = [];
    /**
     * Table comparaison to know if currentValue has been changed
     */
    static comparaisons: Map<string, boolean> = new Map<string, boolean>();

    constructor(){}

    /**
     * Provide a hash used as unique id
     */
    private guid() {

        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    /**
     * Add chart to the registration table
     * @param chart 
     */
    generateId(chart: ChartInterface){
        if(chart.uniqId)
            throw new Error('Chart '+chart.uniqId+' already registered');

        let uniqId = '';
        
        do{
            uniqId = this.guid();
        }while(ChartRegistration.associations.findIndex((item: RegisteredItem) => item.chartId === uniqId) > -1);

        chart.uniqId = uniqId;
    }

    registerFilter(chart: ChartInterface, filter: FilterInterface) {
        const index = ChartRegistration.associations.findIndex((item: RegisteredItem) => item.chartId === chart.uniqId);
        ChartRegistration.associations.push({
            chartId: chart.uniqId,
            filterId: filter.getFullname(),
            currentValue: 'Month',
            oldValue: undefined,
            referenceKey: filter.referenceKey
        });
    }

    /**
     * Remove chart from the registration table
     * @param chart 
     */
    unregister(chart: ChartInterface){
        let index;
         
        while(index = ChartRegistration.associations.findIndex((item: RegisteredItem) => item.chartId === chart.uniqId)) {
            if(index > -1) {
                ChartRegistration.associations.splice(index, 1);
            }
        }
    }

    /**
     * Update associations with new values
     * @param index 
     * @param newValue 
     */
    updateAssociation(index:number, newValue: any) {
        let array = ChartRegistration.associations
        array[index].oldValue = array[index].currentValue;
        array[index].currentValue = newValue;

        ChartRegistration.comparaisons.set(array[index].chartId, false);      
    }
}