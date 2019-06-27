import { Injectable } from '@angular/core';
import * as Color from 'color';
import { Color as ChartColor } from 'ng2-charts';
import { Colors } from '../colors';

@Injectable({
    providedIn: 'root'
})
export class ColorsService {
    constructor() {}

    public chooseRandomColors(colorCount: number): Array<Color> {
        let allColors = [...Colors];
        const pickedColors: Array<Color> = [];

        // Increase the color pool if there are too little colors.
        while (colorCount > allColors.length) {
            allColors = allColors.concat(allColors);
        }

        return this.chooseRandomColorsFromArray(
            colorCount,
            pickedColors,
            allColors
        );
    }

    public chooseRandomColor(): Color {
        return this.chooseRandomColors(1)[0];
    }

    private chooseRandomColorsFromArray(
        count: number,
        pickedColors: Array<Color>,
        remainingColors: Array<Color>
    ) {
        if (pickedColors.length === count) {
            return pickedColors;
        }
        const pickedColorIndex = Math.floor(
            remainingColors.length * Math.random()
        );
        pickedColors.push(remainingColors[pickedColorIndex]);
        remainingColors.splice(pickedColorIndex, 1);

        return this.chooseRandomColorsFromArray(
            count,
            pickedColors,
            remainingColors
        );
    }

    public generateColorSets(colorCount: number): Array<ChartColor> {
        const colors: Array<Color> = this.chooseRandomColors(colorCount);

        return colors.map((color: Color) => {
            return {
                borderColor: color.string(),
                backgroundColor: color
                    .lighten(0.1)
                    .alpha(0.5)
                    .string(),
                pointHoverBackgroundColor: color.darken(0.5).string(),
                hoverBackgroundColor: color.darken(0.3).string(),
                pointBorderColor: color.darken(0.1).string()
            };
        });
    }

    public generateColorsSet(colorCount: number): ChartColor {
        const colors: Array<Color> = this.chooseRandomColors(colorCount);

        const chartColors = {
            borderColor: [],
            backgroundColor: [],
            pointHoverBackgroundColor: [],
            hoverBackgroundColor: [],
            pointBorderColor: []
        };

        colors.forEach((color: Color) => {
            chartColors.borderColor.push(color.string());
            chartColors.backgroundColor.push(
                color
                    .lighten(0.1)
                    .alpha(0.5)
                    .string()
            );
            chartColors.pointHoverBackgroundColor.push(
                color.darken(0.5).string()
            );
            chartColors.hoverBackgroundColor.push(color.darken(0.3).string());
            chartColors.pointBorderColor.push(color.darken(0.1).string());
        });
        return chartColors;
    }
}
