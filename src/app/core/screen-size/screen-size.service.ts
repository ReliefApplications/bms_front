import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DisplayType, Mobile, Other } from 'src/app/models/constants/screen-sizes';



@Injectable({
    providedIn: 'root'
})
export class ScreenSizeService {

    mobileDisplay = new Mobile();
    otherDisplay = new  Other();

    displayTypes = [this.mobileDisplay, this.otherDisplay];

    displayTypeSource: BehaviorSubject<DisplayType>;

    public constructor() {
        const currentDisplay = this.getCurrentDisplay(window.innerWidth, window.innerHeight);
        this.displayTypeSource = new BehaviorSubject<DisplayType>(currentDisplay);
    }

    private getCurrentDisplay(width: number, height: number): DisplayType {
        for (const displayType of this.displayTypes) {

            const {minWidth, maxWidth, minHeight, maxHeight} = displayType;

            if (!this.valueIsInRange(width, minWidth, maxWidth)) {
                continue;
            }
            if (!this.valueIsInRange(height, minHeight, maxHeight)) {
                continue;
            }

            return displayType;
        }
        throw new Error('A display was not defined for this resolution.');
    }

    private valueIsInRange(value: number, lowerBound: number, higherBound: number): boolean {
        if (value < lowerBound) {
            // Value is not greater than or equal to lowerBound
            return false;
        }
        if (higherBound !== undefined && value > higherBound) {
            // Value is greater than higherBound
            return false;
        }
        return true;
    }


    onScreenSizeChange() {
        this.displayTypeSource.next(this.getCurrentDisplay(window.innerWidth, window.innerHeight));
    }
}
