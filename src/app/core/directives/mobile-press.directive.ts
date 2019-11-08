import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { MatRipple } from '@angular/material/core';

@Directive({
    selector: '[appMobilePress]',
    providers: [MatRipple],
})
export class MobilePressDirective {

    private readonly PRESS_DURATION_MS = 400;

    private longPressTimeout: NodeJS.Timer;
    private longPressed = false;
    private canMove = false;
    private touchScrolling = false;

    @Output() longPressing: EventEmitter<void> = new EventEmitter();
    @Output() longPressedAndReleased: EventEmitter<void> = new EventEmitter();

    constructor(private ripple: MatRipple) { }

    @HostBinding('style.background-color')
    backgroundColor: string;


    @HostListener('touchmove', ['$event'])
    onTouchMove(event: any) {
        if (this.canMove) {
            // We clean the long pressed button
            clearTimeout(this.longPressTimeout);
            this.longPressed = false;

            // Now we are scrolling
            this.touchScrolling = true;
        }
    }

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    onMouseDown(event: any) {
        // Means that we can scroll after having touch
        this.canMove = true;

        // We select an item if we press it for enough time. We cant move after that
        this.longPressTimeout = setTimeout(() => {
        this.longPressed = true;
        this.canMove = false;
        this.backgroundColor = '#979B9E'; // $bms_slate
        }, this.PRESS_DURATION_MS);
    }


    @HostListener('mouseup', ['$event'])
    @HostListener('touchend', ['$event'])
    onMouseUp(event: any) {
        this.backgroundColor = '';

        // If we are not scrolling, then we touched a button
        if (!this.touchScrolling) {
            // Cancel long press monitoring
            clearTimeout(this.longPressTimeout);

            // If we pressed the button for enough time
            if (this.longPressed) {
                this.longPressedAndReleased.emit();
            }
            this.longPressed = false;
        }

        // We were scrolling but now we are not
        else {
            this.touchScrolling = false;
        }
    }

    @HostListener('mouseout', ['$event'])
    onMouseOut(event: any) {
        event.preventDefault();
        event.stopPropagation();

        // Cancel long press monitoring
        clearTimeout(this.longPressTimeout);
    }
}
