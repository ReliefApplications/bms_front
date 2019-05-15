import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatCheckbox, MatDialog, MatStepper } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Household } from 'src/app/models/household';
import { ImportService } from '../../../core/api/beneficiaries-import.service';
import { ModalConfirmationComponent } from '../../../components/modals/modal-confirmation/modal-confirmation.component';


enum Step {
    Import = 1,
    Typos = 2,
    More = 3,
    Less = 4,
    Duplicates = 5,
    Update = 6,
    Completed = 7,

}

enum State {
    KeepOld = 0,
    KeepNew = 1,
    KeepBoth = 2,
}

enum CheckboxState {
    NotChecked = 0,
    Indeterminate = 1,
    Checked = 2,
}

@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    @ViewChild('stepper') stepper: MatStepper;

    currentStep: number;

    errors: Array<any> = [];

    form: FormArray;
    oldControl: FormArray;
    newControl: FormArray;

    showMembers: boolean;

    public step = Step;
    public checkboxState = CheckboxState;

    public helpDisplayed = true;


    public loading = false;
    public loadingStep = false;

//
// ─── INIT ───────────────────────────────────────────────────────────────────────
//

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private importService: ImportService,
        private router: Router,
        private snackbar: SnackbarService,
        public dialog: MatDialog,
        private languageService: LanguageService,
    ) {}

    public ngOnInit() {
        try {
            const response = this.importService.getResponse();
            this.errors = response.data;
            this.setStepFromResponse(response);
            this.generateControls();
        // If the import context has not been set
        } catch (error) {
            this.snackbar.error(this.language.beneficiaries_import_error_importing);
            this.router.navigate(['beneficiaries/import']);
        }
    }

//
// ─── SUBMIT STEP ────────────────────────────────────────────────────────────────
//
    // Send step data to the server
    public validateStep() {
        this.loadingStep = true;
        this.importService.sendStepUserData(this.generateResponse())
            .subscribe((response: any) => {
                if (response) {
                    this.errors = response.data;
                    this.setStepFromResponse(response);
                }
                this.generateControls();
                this.loadingStep = false;
        });
    }

    // Get the step from the response and set it in the component
    private setStepFromResponse(response: any) {
        this.helpDisplayed = true;
        this.currentStep = response.step;
        this.stepper.selectedIndex = this.currentStep - 2 ;
    }

    public finishImport() {
        this.loading = true;
        this.importService.sendStepUserData(this.generateResponse())
        .subscribe((response: any) => {
            this.loading = false;
                // No further interaction with the backend after this
                this.currentStep = Step.Completed;

                if (response) {
                    this.importService.importedHouseholds = response.map((household: Household) => Household.apiToModel(household));
                }

                this.router.navigate(['/beneficiaries/imported']);
            },
        (_error: any) => {
            this.loading = false;
        });
    }

//
// ─── FORM CONTROL GENERATION ────────────────────────────────────────────────────
//
    private generateControls() {
        if (this.currentStep === Step.Typos) {
            this.generateTyposControls();
        } else if (this.currentStep === Step.More ) {
            this.generateMoreControls();
        } else if (this.currentStep === Step.Less ) {
            this.generateLessControls();
        } else if (this.currentStep === Step.Duplicates ) {
            this.generateDuplicatesControls();
        } else {
            this.form = null;
        }
    }

    private generateTyposControls() {
        const formArray = [];

        this.errors.forEach((_: any) => {
            formArray.push(
                new FormGroup({
                    old: new FormControl(false),
                    new: new FormControl(false),
                },
                {
                    validators: this.validateCheckboxPair
                })
            );
        });
        this.form = new FormArray(formArray);
    }

    private generateDuplicatesControls() {
        const formArray = [];

        this.errors.forEach((error: any) => {
            const duplicatesFormGroup = new FormGroup({
                old: new FormControl(false),
                new: new FormControl(false),
            },
            {
                validators: this.validateCheckboxPair
            });

            // Check and disable head of households
            if (error.old.status === true || error.old.status === '1') {
                duplicatesFormGroup.controls['old'].setValue(true);
                duplicatesFormGroup.controls['old'].disable();
            }
            if (error.new.status === true || error.new.status === '1') {
                duplicatesFormGroup.controls['new'].setValue(true);
                duplicatesFormGroup.controls['new'].disable();
            }

            formArray.push(duplicatesFormGroup);
        });
        this.form = new FormArray(formArray);
    }

    private validateCheckboxPair(control: AbstractControl): object {
        if (control.get('old').value || control.get('new').value) {
            return null;
        }
        return { noOptionSelected: true};
    }

    private generateMoreControls() {
        this.generateAddOrLessControls('new');
    }

    private generateLessControls() {
        this.generateAddOrLessControls('old');
    }

    private generateAddOrLessControls(newOrOld: string) {
        const initialState = (newOrOld === 'new');

        const householdsFormArray = new FormArray([]);
        this.errors.forEach((error: any) => {
            const beneficiariesFormArray = new FormArray([]);
            error[newOrOld]['beneficiaries'].forEach((_: any) => {
                beneficiariesFormArray.push(new FormControl(initialState));
            });
            householdsFormArray.push(beneficiariesFormArray);
        });
        this.form = householdsFormArray;
    }
//
// ─── CHECKBOXES STATES UPDATERS ─────────────────────────────────────────────────
//
    // For less and more steps
    public setAllCheckboxesValues(checkboxState: MatCheckbox) {
        this.form.value.forEach((householdValue: boolean[], householdIndex: number)  => {
            householdValue.forEach((_beneficiaryValue: boolean, beneficiaryIndex: number) => {
                this.form.get([householdIndex, beneficiaryIndex]).setValue(checkboxState.checked);
            });
        });
    }

    // For typo and dups steps
    public setAllOldCheckboxesValues(checkboxState: MatCheckbox) {
        this.setAllTypedCheckboxesValues('old', checkboxState.checked);
    }
    // For typo and dups steps
    public setAllNewCheckboxesValues(checkboxState: MatCheckbox) {
        this.setAllTypedCheckboxesValues('new', checkboxState.checked);
    }

    private setAllTypedCheckboxesValues(type: string, value: boolean ) {
        this.form.controls.forEach((control: FormGroup) => {
            if (control.contains(type)) {
                control.get(type).setValue(value);
            }
        });
    }


//
// ─── CHECKBOXES VALUES FETCHERS ─────────────────────────────────────────────────
//
    // Global checkbox is not checked if one checkbox is not checked (except head of household)
    public getGlobalCheckboxState(): CheckboxState {
        let hasChecked = false;
        let hasNotChecked = false;
        this.form.value.forEach((householdValue: boolean[])  => {
            householdValue.forEach((beneficiaryValue: boolean, beneficiaryIndex: number) => {
                if (beneficiaryIndex !== 0) {
                    switch (beneficiaryValue) {
                        case true:
                            hasChecked = true;
                            break;
                        case false:
                            hasNotChecked = true;
                            break;
                    }
                }
            });
        });
        return this.getCheckboxState(hasChecked, hasNotChecked);
    }

    public getStatusCheckboxState(oldOrNew: string): CheckboxState {
        let hasChecked = false;
        let hasNotChecked = false;
        this.form.value.forEach((headValue: any) => {
            switch (headValue[oldOrNew]) {
                case true:
                    hasChecked = true;
                    break;
                case false:
                    hasNotChecked = true;
            }
        });
        return this.getCheckboxState(hasChecked, hasNotChecked);
    }

    private getCheckboxState(hasChecked: boolean, hasNotChecked: boolean): CheckboxState {
        // If one (or more) checkbox is checked and another one (or more) not checked, then state is indeterminate
        if (hasChecked && hasNotChecked) {
            return CheckboxState.Indeterminate;
        }
        if (hasChecked) {
            return CheckboxState.Checked;
        }
        if (hasNotChecked) {
            return CheckboxState.NotChecked;
        }
    }

//
// ─── RESPONSES GENERATORS ───────────────────────────────────────────────────────
//
    private generateResponse(): object {
        if (this.currentStep === Step.Typos) {
            return this.generateTyposOrDuplicatesResponse();
        } else if (this.currentStep === Step.More) {
            return this.generateMoreResponse();
        } else if (this.currentStep === Step.Less) {
            return this.generateLessResponse();
        } else if (this.currentStep === Step.Duplicates) {
            return this.generateTyposOrDuplicatesResponse();
        }
    }

    // Send back the housholds new / old pair, adding a 'state' entry describing which HH to keep.
    private generateTyposOrDuplicatesResponse(): object {

        const response = this.errors.map((error: any, index: number) => {
            return {
                ...error,
                state: this.getErrorStep(
                    this.getValueFromStatusAndIndex('old', index),
                    this.getValueFromStatusAndIndex('new', index)
                )
            };
        });

        return {
            errors: response
        };
    }

    private getErrorStep(oldValue: boolean, newValue: boolean) {
        if (oldValue && newValue) {
            return State.KeepBoth;
        } else if (oldValue) {
            return State.KeepOld;
        } else if (newValue) {
            return State.KeepNew;
        }
        else {
            this.snackbar.error(this.language.beneficiaries_import_error_selection);
        }
    }

    private getValueFromStatusAndIndex(status: string, index: number) {
        return this.form.controls[index].get(status).value;
    }

    // Send back the housholds new / old pair, adding a 'state' entry describing which Beneficiary to keep.
    private generateMoreResponse(): object {
        return this.generateAddOrLessResponse('new');
    }

    private generateLessResponse(): object {
        return this.generateAddOrLessResponse('old');
    }

    private generateAddOrLessResponse(newOrOld: string): object {
        const response = this.errors.map((error: object, householdIndex: number) => {
            error[newOrOld].beneficiaries =  error[newOrOld].beneficiaries.filter((_beneficiaries: any, beneficiaryIndex: number) => {
                // Ensure the head is always returned
                if (beneficiaryIndex === 0 ) {
                    return true;
                }
                return this.getValueFromIndexes(householdIndex, beneficiaryIndex);
            });
            return error;
        });
        return {
            errors: response,
        };
    }

    private getValueFromIndexes(householdIndex: number, beneficiaryIndex: number): boolean {
        return this.form.controls[householdIndex].get([beneficiaryIndex]).value;
    }


//
// ─── MISC ───────────────────────────────────────────────────────────────────────
//
    // Get the list of checked beneficiaries in the 'old' column to display them in the 'new' coumn at 'less' step
    getOldRestoredBeneficiaries(householdIndex: number): object {
        return this.errors[householdIndex]['old'].beneficiaries.filter((_beneficiary: any, beneficiaryIndex: number) => {
            if (beneficiaryIndex === 0) {
                return false;
            }
            return this.getValueFromIndexes(householdIndex, beneficiaryIndex);
        });
    }

//
// ─── LEAVE CONFIRMATION ─────────────────────────────────────────────────────────
//

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.currentStep === Step.Completed) {
            return true;
        }
        const dialogRef = this.dialog.open(ModalConfirmationComponent, {
            data: {
                title: this.language.modal_leave,
                sentence: this.language.modal_leave_sentence,
                ok: this.language.modal_leave
            }
        });

        return dialogRef.afterClosed();
    }

}
