import * as Color from 'color';
import { Color as ChartColor } from 'ng2-charts';

export const Colors: Array<Color> = [
    Color('#132F30'),
    Color('#02617F'),
    Color('#4AA896'),
    Color('#585A5E'),
    Color('#979B9E'),
    Color('#51C9DF'),
    Color('#DC3D49'),
    Color('#A6F2F9'),
    Color('#134252'),
    Color('#c5c5ce'),
];

export class Colorizer {
    public static chooseRandomColors(colorCount: number): Array<Color> {
        let allColors = [...Colors];
        const pickedColors: Array<Color> = [];

        // Increase the color pool if there are too little colors.
        while (colorCount > allColors.length) {
            allColors = allColors.concat(allColors);
        }

        return Colorizer.chooseRandomColorsFromArray(colorCount, pickedColors, allColors);

    }

    public static chooseRandomColor(): Color {
        return this.chooseRandomColors(1)[0];
    }

    private static chooseRandomColorsFromArray(count: number, pickedColors: Array<Color>, remainingColors: Array<Color>) {
        if (pickedColors.length === count) {
            return pickedColors;
        }
        const pickedColorIndex = Math.floor(remainingColors.length * Math.random());
        pickedColors.push(remainingColors[pickedColorIndex]);
        remainingColors.splice(pickedColorIndex, 1);

        return Colorizer.chooseRandomColorsFromArray(count, pickedColors, remainingColors);
    }

    public static generateColorSets(colorCount: number): Array<ChartColor> {
        const colors: Array<Color> = this.chooseRandomColors(colorCount);

        return colors.map((color: Color) => {
            return {
                borderColor: color.string(),
                backgroundColor: color.lighten(0.1).alpha(0.5).string(),
                pointHoverBackgroundColor: color.darken(0.5).string(),
                hoverBackgroundColor: color.darken(0.3).string(),
                pointBorderColor: color.darken(0.1).string(),
            };
        });
    }

    public static generateColorsSet(colorCount: number): ChartColor {
        const colors: Array<Color> = this.chooseRandomColors(colorCount);

        const chartColors = {
            borderColor: [],
            backgroundColor: [],
            pointHoverBackgroundColor: [],
            hoverBackgroundColor: [],
            pointBorderColor: [],
        };

        colors.forEach((color: Color) => {
            chartColors.borderColor.push(color.string());
            chartColors.backgroundColor.push(color.lighten(0.1).alpha(0.5).string());
            chartColors.pointHoverBackgroundColor.push(color.darken(0.5).string());
            chartColors.hoverBackgroundColor.push(color.darken(0.3).string());
            chartColors.pointBorderColor.push(color.darken(0.1).string());
        });
        return chartColors;
    }
}
