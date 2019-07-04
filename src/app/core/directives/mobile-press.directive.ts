import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[appMobilePress]'
})
export class MobilePressDirective {

    private readonly PRESS_DURATION_MS = 500;

    private longPressTimeout: NodeJS.Timer;
    private longPressed = false;

    @Output() longPressing: EventEmitter<void> = new EventEmitter();
    @Output() longPressedAndReleased: EventEmitter<void> = new EventEmitter();
    @Output() shortPressedAndReleased: EventEmitter<void> = new EventEmitter();

    constructor() { }

    @HostBinding('style.background-color')
    backgroundColor: string;

    @HostListener('mousedown', ['$event']) onMouseDown(event: any) {
        event.preventDefault();
        event.stopPropagation();
        this.backgroundColor = 'grey';
        this.longPressTimeout = setTimeout(() => {
            this.longPressed = true;
        }, this.PRESS_DURATION_MS);
    }


    @HostListener('mouseup', ['$event']) onMouseUp(event: any) {
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
