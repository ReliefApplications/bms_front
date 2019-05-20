import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatTableDataSource, MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { Distribution } from 'src/app/models/distribution';
import { ImportedBeneficiary } from 'src/app/models/imported-beneficiary';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { BeneficiariesService } from '../../../../core/api/beneficiaries.service';
import { DistributionService } from '../../../../core/api/distribution.service';
import { HouseholdsService } from '../../../../core/api/households.service';
import { Validators, FormControl } from '@angular/forms';

const IMPORT_COMPARE = 1;
const IMPORT_UPDATE = 2;

@Component({
    selector: 'app-import-distribution',
    templateUrl: './import-distribution.component.html',
    styleUrls: ['./import-distribution.component.scss']
})
export class ImportDistributionComponent implements OnInit, OnDestroy {

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

    public modalReference: MatDialogRef<any>;
    public justification = new FormControl('', [Validators.required]);

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

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;


    constructor(
        public _householdsService: HouseholdsService,
        public snackbar: SnackbarService,
        public distributionService: DistributionService,
        public beneficiaryService: BeneficiariesService,
        public userService: UserService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        this.comparing = false;
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
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
                if (this.isJustified()) {
                    this.loadUpdate = true;
                    this.beneficiaryService.import(this.distribution.get('id'), { data: this.importedData }, IMPORT_UPDATE).pipe(
                        finalize(() => {
                            this.loadUpdate = false;
                        })
                    ).subscribe(
                        (_success: any) => {
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
            }
        } else {
            this.snackbar.error(this.language.import_distribution_no_right_update);
        }
    }

    isJustified() {
        let justify = true;
        const justifiedTypes = ['created', 'added', 'deleted'];
        justifiedTypes.forEach((type: string) => {
            this.importedData[type].forEach((beneficiary: any) => {
                if (!beneficiary['justification']) {
                    justify = false;
                    this.snackbar.error(this.language['distribution_justify_' + type]);
                }
            });
        });
        return justify;
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

    justify(importedBeneficiary: ImportedBeneficiary, template) {
        this.justification.setValue(importedBeneficiary.get('justification'));
        this.modalReference = this.dialog.open(template);
        this.modalReference.afterClosed().subscribe((message: string) => {
            if (message === 'add') {
                importedBeneficiary.set('justification', this.justification.value);
                const familyName = importedBeneficiary.get('beneficiary').get('familyName');
                const givenName = importedBeneficiary.get('beneficiary').get('givenName');

                const correspondingAdded = this.importedData.added.filter((added: any) => {
                    return added.family_name === familyName && added.given_name === givenName;
                })[0];
                const correspondingCreated = this.importedData.created.filter((created: any) => {
                    return created.familyName === familyName && created.givenName === givenName;
                })[0];
                const correspondingDeleted = this.importedData.deleted.filter((deleted: any) => {
                    return deleted.familyName === familyName && deleted.givenName === givenName;
                })[0];

                let index: number;

                if (correspondingAdded) {
                    index = this.importedData.added.indexOf(correspondingAdded);
                    this.importedData.added[index]['justification'] = this.justification.value;
                } else if (correspondingCreated) {
                    index = this.importedData.created.indexOf(correspondingCreated);
                    this.importedData.created[index]['justification'] = this.justification.value;
                } else if (correspondingDeleted) {
                    index = this.importedData.deleted.indexOf(correspondingDeleted);
                    this.importedData.deleted[index]['justification'] = this.justification.value;
                }
            }

            this.justification.setValue('');
        });
    }

    justifyAll(type: string, template) {
        this.modalReference = this.dialog.open(template);
        this.modalReference.afterClosed().subscribe((message: string) => {
            if (message === 'add') {
                this.importedData[type].forEach((beneficiary: any) => {
                    beneficiary['justification'] = this.justification.value;
                });
                if (type === 'added') {
                    this.addingData.data.forEach((importedBeneficiary: ImportedBeneficiary) => {
                        importedBeneficiary.set('justification', this.justification.value);
                    });
                } else if (type === 'created') {
                    this.createData.data.forEach((importedBeneficiary: ImportedBeneficiary) => {
                        importedBeneficiary.set('justification', this.justification.value);
                    });
                } else if (type === 'deleted') {
                    this.removingData.data.forEach((importedBeneficiary: ImportedBeneficiary) => {
                        importedBeneficiary.set('justification', this.justification.value);
                    });
                }
            }
            this.justification.setValue('');
        });
    }

    onCancel() {
        this.modalReference.close('cancel');
    }

    onAdd() {
        this.modalReference.close('add');
    }
}
