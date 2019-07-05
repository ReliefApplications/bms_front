import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { MatRipple } from '@angular/material/core';

@Directive({
    selector: '[appMobilePress]',
    providers: [MatRipple],
})
export class MobilePressDirective {

    private readonly PRESS_DURATION_MS = 500;

    private longPressTimeout: NodeJS.Timer;
    private longPressed = false;

    @Output() longPressing: EventEmitter<void> = new EventEmitter();
    @Output() longPressedAndReleased: EventEmitter<void> = new EventEmitter();
    @Output() shortPressedAndReleased: EventEmitter<void> = new EventEmitter();

    constructor(private ripple: MatRipple) { }

    @HostBinding('style.background-color')
    backgroundColor: string;

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    onMouseDown(event: any) {
        event.preventDefault();
        event.stopPropagation();
        this.longPressTimeout = setTimeout(() => {
            this.longPressed = true;
            this.backgroundColor = '#979B9E'; // $bms_slate
        }, this.PRESS_DURATION_MS);
    }


    @HostListener('mouseup', ['$event'])
    @HostListener('touchend', ['$event'])
    onMouseUp(event: any) {
        event.preventDefault();
        event.stopPropagation();
        this.backgroundColor = '';

        // Cancel long press monitoring
        clearTimeout(this.longPressTimeout);
        if (this.longPressed) {
            this.longPressedAndReleased.emit();
        }
        else {
            this.shortPressedAndReleased.emit();

        }
        this.longPressed = false;
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: any) {
        event.preventDefault();
        event.stopPropagation();

        // Cancel long press monitoring
        clearTimeout(this.longPressTimeout);
    }
}
