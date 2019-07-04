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
        // event.preventDefault();
        // event.stopPropagation();
        const { clientX, clientY } = ('clientX' in event ? event : event.touches[0]);
        this.backgroundColor = 'grey';
        this.longPressTimeout = setTimeout(() => {
            this.longPressed = true;
            this.backgroundColor = 'white';
            setTimeout(() => {
                this.backgroundColor = 'grey';
            }, 250);
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
}
