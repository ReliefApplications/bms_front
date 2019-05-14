export class DisplayType {
    type: string;

    // To define a lower boundary, set the value to 0
    // To define a higher boundary, set the value to undefined

    minWidth: number;
    maxWidth: number;

    minHeight: number;
    maxHeight: number;
}

export class Mobile extends DisplayType {
    type = 'mobile';

    minWidth = 0;
    maxWidth = 750;

    minHeight = 0;
    maxHeight = undefined;
}

export class Other extends DisplayType {
    type = 'other';

    minWidth = 751;
    maxWidth = undefined;

    minHeight = 601;
    maxHeight = undefined;
}



