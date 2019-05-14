import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/FileSaver';
import { AppInjector } from 'src/app/app-injector';
import { LanguageService } from 'src/app/core/language/language.service';
import { HouseholdFilters } from 'src/app/models/data-sources/households-data-source';
import { VulnerabilityCriteria } from 'src/app/models/vulnerability-criteria';
import { URL_BMS_API } from '../../../environments/environment';
import { Household, Livelihood } from '../../models/household';
import { Location } from '../../models/location';
import { Project } from '../../models/project';
import { CriteriaService } from './criteria.service';
import { CustomModelService } from '../utils/custom-model.service';
import { ExportService } from './export.service';
import { HttpService } from '../network/http.service';
import { LocationService } from './location.service';
import { ProjectService } from './project.service';
import { Gender, ResidencyStatus } from 'src/app/models/beneficiary';
import { LIVELIHOOD } from 'src/app/models/livelihood';

@Injectable({
    providedIn: 'root'
})
export class HouseholdsService extends CustomModelService {
    readonly api = URL_BMS_API;
    customModelPath = 'households';


    constructor(
        protected http: HttpService,
        private exportService: ExportService,
        private router: Router,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    /**
     * Get all households
     * @param body any
     */
    public get(filter: any, sort: any, pageIndex: number, pageSize: number) {
        const url = this.api + '/households/get/all';
        return this.http.post(url, {filter, sort, pageIndex, pageSize});
    }

    public getOne(beneficiaryId) {
        const url = this.api + '/households/' + beneficiaryId;
        return this.http.get(url);
    }

    /**
     * Get the csv template to import household
     */
    public getTemplate() {
        const url = this.api + '/csv/households/export';
        return this.http.get(url).toPromise()
        .then(response => {
            saveAs(response, 'households_template' + '.' + 'xls');
        });
    }

    /**
     * Get all households
     * @param newHouseholds any
     */
    public getImported(newHouseholds: any) {
        const url = this.api + '/households/get/imported';
        return this.http.post(url, {households: newHouseholds});
    }

    /**
     * Upload CSV  and data validation to import new household
     * @param body any
     * @param projectId number
     * @param step number
     * @param token string
     */
    public sendDataToValidation(email: string, body: any, projectId: number, token?: string) {
        const params = {
            token: token !== undefined ? token : '',
            email: email,
        } ;

        return this.http.post(`${this.api}/import/households/project/${projectId}`, body, {params});
    }

    /**
     * Add household.
     * @param hh
     * @param projects_ids
     */
    public add(hh: any, projects_ids: string[]) {
        const url = this.api + '/households';
        const body = {
            household: hh,
            projects: projects_ids
        };
        return this.http.put(url, body);
    }

    /**
     * Update household.
     * @param householdId
     * @param hh
     * @param projects_ids
     */
    public edit(householdId: number, hh: any, projects_ids: string[]) {
        const url = this.api + '/households/' + householdId;
        const body = {
            household: hh,
            projects: projects_ids
        };
        return this.http.post(url, body);
    }

    /**
     * Export beneficiaries
     * @param  extensionType type of file to export
     * @return               file
     */
    public export (extensionType: string, filters: any = null, ids: Array<string> = []) {
        return this.exportService.export('beneficiaries', true, extensionType, {}, filters, ids);
    }

    /**
     * Export householdsTemplate
     * @param  extensionType type of file to export
     * @return               file
     */
    public exportTemplate (extensionType: string) {
        return this.exportService.export('householdsTemplate', true, extensionType);
    }

    public delete(householdId: number) {
        const url = this.api + '/households/' + householdId;
        return this.http.delete(url);
    }

    public deleteMany(householdIds: Array<number>) {
        const url = this.api + '/delete-households';
        const body = {
            ids: householdIds
        };
        return this.http.post(url, body);
    }

    public testFileTemplate(file: any, location: any) {
        const params = {};
        params['type'] = 'xls';
        params['templateSyria'] = true;

        const options = {
            responseType: 'blob',
            params: params
        };

        const url = this.api + '/import/households?adm=' + location.adm + '&name=' + location.name;
        return this.http.post(url, file, options).toPromise()
            .then((response) => {
                saveAs(response, 'templateSyria.xls');
            });
    }

    public fillWithOptions(household: Household) {

        const appInjector = AppInjector;
        appInjector.get(ProjectService).get().subscribe((projects: any) => {

            const projectOptions = projects.map(project => {
                return Project.apiToModel(project);
            });

            household.setOptions('projects', projectOptions);
        });
    }

    public fillFiltersWithOptions(filters: HouseholdFilters) {
        const appInjector = AppInjector;

        // Get Projects
        appInjector.get(ProjectService).get().subscribe((projects: any) => {

            const projectOptions = projects.map(project => {
                return Project.apiToModel(project);
            });

            filters.setOptions('projects', projectOptions);
        });

        // Get vulnerabilities
        appInjector.get(CriteriaService).getVulnerabilityCriteria().subscribe((vulnerabilities: any) => {

            const vulnerabilityOptions = vulnerabilities.map(vulnerability => {
                return VulnerabilityCriteria.apiToModel(vulnerability);
            });

            filters.setOptions('vulnerabilities', vulnerabilityOptions);
        });

        // Get gender
        const genderOptions = [
            new Gender('0', this.language.add_distribution_female),
            new Gender('1', this.language.add_distribution_male)
        ];
        filters.setOptions('gender', genderOptions);

        // Get residency status
        const residencyOptions = [
            new ResidencyStatus('refugee', this.language.residency_refugee),
            new ResidencyStatus('IDP', this.language.residency_idp),
            new ResidencyStatus('resident', this.language.residency_resident)
        ];
        filters.setOptions('residency', residencyOptions);

        // Get livelihood
        const livelihoodOptions = LIVELIHOOD.map(livelihood => new Livelihood(livelihood.id, this.language[livelihood.language_key]));
        filters.setOptions('livelihood', livelihoodOptions);

        // Get adm1
        filters.set('location', new Location());
        appInjector.get(LocationService).fillAdm1Options(filters).subscribe();


    }

    public visit(householdId) {
        this.router.navigate(['/beneficiaries/update-beneficiary', householdId]);
    }
}
