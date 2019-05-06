import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Distribution } from 'src/app/model/distribution';
import { LanguageService } from 'src/texts/language.service';
import { BeneficiariesService } from '../../../../core/api/beneficiaries.service';
import { DistributionService } from '../../../../core/api/distribution.service';
import { HouseholdsService } from '../../../../core/api/households.service';
import { ImportedBeneficiary } from '../../../../model/imported-beneficiary';

const IMPORT_COMPARE = 1;
const IMPORT_UPDATE = 2;

@Component({
    selector: 'app-import-distribution',
    templateUrl: './import-distribution.component.html',
    styleUrls: ['./import-distribution.component.scss']
})
export class ImportDistributionComponent implements OnInit {

    @Input() distribution: Distribution;

    @Output() success = new EventEmitter<boolean>();
    @Output() selected = new EventEmitter<boolean>();

    // upload
    response = '';
    public csv = null;
    public importedData = null;
    comparing: boolean;

    // indicators
    importedBeneficiaryEntity = ImportedBeneficiary;
    public loadFile = false;
    public loadUpdate = false;

    // data
    addingData: MatTableDataSource<ImportedBeneficiary>;
    removingData: MatTableDataSource<ImportedBeneficiary>;
    createData: MatTableDataSource<ImportedBeneficiary>;
    updateData: MatTableDataSource<ImportedBeneficiary>;

    // data info
    numberAdded = 0;
    numberRemoved = 0;
    numberCreated = 0;
    numberUpdated = 0;
    noChanges = true;

    // Screen display variables.
    dragAreaClass = 'dragarea';
    public maxHeight = 600;
    public maxWidth = 750;
    public heightScreen;
    public widthScreen;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;


    constructor(
        public _householdsService: HouseholdsService,
        public snackbar: SnackbarService,
        public distributionService: DistributionService,
        public beneficiaryService: BeneficiariesService,
        public userService: UserService,
        public languageService: LanguageService,
    ) { }

    ngOnInit() {
        this.comparing = false;
        this.checkSize();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
     * Detect when the file change with the file browse or with the drag and drop
     * @param event
     * @param typeEvent
     */
    fileChange(event, typeEvent) {
        let fileList: FileList;
        switch (typeEvent) {
            case 'dataTransfer': fileList = event.dataTransfer.files; break;
            case 'target': fileList = event.target.files; break;
            default: break;
        }

        if (fileList.length > 0) {
            this.selected.emit(true);
            this.csv = fileList[0];
        }
    }

    /**
     * Upload csv and import the new distribution (list of beneficiaries)
     */
    updateDistribution(step: number) {
        if (this.userService.hasRights('ROLE_DISTRIBUTIONS_MANAGEMENT')) {

            const data = new FormData();
            data.append('file', this.csv);

            if (this.csv && step === IMPORT_COMPARE) {
                this.loadFile = true;
                this.beneficiaryService.import(this.distribution.get('id'), data, IMPORT_COMPARE).subscribe(
                    result => {
                        this.comparing = true;
                        this.loadFile = false;
                        this.importedData = result;

                        const createList = this.importedData.created.map((beneficiary: any) => ImportedBeneficiary.apiToModel(beneficiary));
                        const addList = this.importedData.added.map((beneficiary: any) => ImportedBeneficiary.apiToModel(beneficiary));
                        const removeList = this.importedData.deleted.map((beneficiary: any) => ImportedBeneficiary.apiToModel(beneficiary));
                        const updateList = this.importedData.updated.map((beneficiary: any) => ImportedBeneficiary.apiToModel(beneficiary));

                        this.numberCreated = createList ? createList.length : 0;
                        this.numberAdded = addList ? addList.length : 0;
                        this.numberRemoved = removeList ? removeList.length : 0;
                        this.numberUpdated = updateList ? updateList.length : 0;
                        this.noChanges = (this.numberCreated + this.numberAdded + this.numberRemoved + this.numberUpdated === 0);

                        this.createData = new MatTableDataSource(createList);
                        this.addingData = new MatTableDataSource(addList);
                        this.removingData = new MatTableDataSource(removeList);
                        this.updateData = new MatTableDataSource(updateList);

                        this.csv = null;
                    },
                    error => {
                        this.loadFile = false,
                            this.csv = null;
                    }
                );
            } else if (this.importedData && step === IMPORT_UPDATE) {
                this.loadUpdate = true;
                this.beneficiaryService.import(this.distribution.get('id'), { data: this.importedData }, IMPORT_UPDATE).pipe(
                    finalize(() => {
                        this.loadUpdate = false;
                    })
                ).subscribe(
                    success => {
                        this.snackbar.success(this.language.import_distribution_updated);
                        this.success.emit(true);
                        this.loadUpdate = false;
                        this.importedData = null;
                        this.comparing = false;
                    },
                    error => {
                        this.loadUpdate = false,
                            this.comparing = false;
                    }
                );
            }
        } else {
            this.snackbar.error(this.language.import_distribution_no_right_update);
        }
    }

    goBack() {
        this.comparing = false;
    }

    /**
     * All listener for the drag and drop
     * @param event
     */
    @HostListener('dragover', ['$event']) onDragOver(event) {
        this.dragAreaClass = 'dragarea-hover';
        event.preventDefault();
    }
    @HostListener('dragenter', ['$event']) onDragEnter(event) {
        this.dragAreaClass = 'dragarea-hover';
        event.preventDefault();
    }
    @HostListener('dragend', ['$event']) onDragEnd(event) {
        this.dragAreaClass = 'dragarea';
        event.preventDefault();
    }
    @HostListener('dragleave', ['$event']) onDragLeave(event) {
        this.dragAreaClass = 'dragarea';
        event.preventDefault();
    }
    @HostListener('drop', ['$event']) onDrop(event) {
        this.dragAreaClass = 'dragarea';

        // setting the data is required by firefox
        event.dataTransfer.setData('text', 'firefox');

        event.preventDefault();
        event.stopPropagation();

        this.fileChange(event, 'dataTransfer');
    }
}
