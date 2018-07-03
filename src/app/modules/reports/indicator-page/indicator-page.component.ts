import { Component, OnInit, ViewChild, SimpleChanges, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { IndicatorService } from '../services/indicator.service';
import { FilterEvent, FilterInterface, AbstractFilter } from '../model/filter';
import { Indicator } from '../model/indicator';
import { CacheService } from '../../../core/storage/cache.service';
import { ButtonFilterData, ButtonFilterComponent } from '../filters/button-filter/button-filter.component';
import { ChartRegistration, RegisteredItem } from '../services/chart-registration.service';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
  selector: 'app-indicator-page',
  templateUrl: './indicator-page.component.html',
  styleUrls: ['./indicator-page.component.scss']
})
export class IndicatorPageComponent implements OnInit {

  @ViewChild('chart') chartDiv;

  @ViewChildren(ButtonFilterComponent) buttonFilters: QueryList<ButtonFilterComponent>;

  public type = "Organisation";
  public filters: Map<string, FilterInterface> = new Map<string, FilterInterface>();
  public body: any = [];
  public indicators: any[] = [];
  public filtersButton;

  //Data Button Declaration
  public dataFilter1: Array<ButtonFilterData> = [
    { label: 'By year', value: 'year', active: true },
    { label: 'By trimester', value: 'quarter', active: false },
    { label: 'By month', value: 'month', active: false },
  ]

  public dataFilter2: Array<ButtonFilterData> = [
    { label: 'View organisation', value: 'Organisation', active: true },
    { label: 'View roster', value: 'Roster', active: false },
    { label: 'View event', value: 'Event', active: false },
  ]

  public chartDimensions: number[];
  public organisationManager: boolean = false;
  public indicatorsLoading = false;

  constructor(
    public referedClassService: IndicatorService,
    public cacheService: CacheService,
    public chartRegistrationService: ChartRegistration
  ) {
  }

  ngOnInit() {
    if (!this.indicatorsLoading) {
      this.indicatorsLoading = true;
        this.referedClassService.getIndicators().toPromise().then(response => {
        this.indicators = response as any;
        this.indicatorsLoading = false
      }).catch(e => {
        this.indicatorsLoading = false;
      }); 
    }
  }

  ngAfterViewInit() {
    if (this.chartDiv) {
      this.chartDimensions = [400, 300];
    }
    //Get button reference in the template and store it in variable
    this.filtersButton = this.buttonFilters;
  }

  /**
   * Call the function to connect a chart with its filters
   * @param e 
   */
  onFilter(e: FilterEvent) {
    ChartRegistration.associations
      .forEach((item: RegisteredItem, index: number, array: RegisteredItem[]) => {
        if (item.filterId === AbstractFilter.formatFullname(e.page, e.id)) {
          const filter = this.filters.get(item.filterId);
          this.chartRegistrationService.updateAssociation(index, e.data);
        }
      });

    //Verify the type (here : roster, organisation, event) to display the good charts
    this.dataFilter2.forEach(filter => {
      if (filter['active']) {
        this.type = filter['value'];
      }

    });
  }

  /**
   * Update local variable filters with filters in parameters
   * @param filters 
   */
  updateFilters(filters: FilterInterface[]): Array<FilterInterface> {
    filters.forEach((filter: FilterInterface) => {
      this.filters.set(filter.getFullname(), filter);
    })
    return filters;
  }

  /**
   * Compare indicator's filter and the filter in the page 
   * to create the good association
   * @param filtersIndicator 
   */
  findFilter(filtersIndicator: string[]) {
    let filters: Array<FilterInterface> = [];
    this.filtersButton._results.forEach(filterButton => {
      filtersIndicator.forEach(filter => {
        if (filter == filterButton.referenceKey) {
          filters.push(filterButton);
        }
      })
    });
    if (filters.length) {
      return this.updateFilters(filters);
    }
    return filters;
  }

}
