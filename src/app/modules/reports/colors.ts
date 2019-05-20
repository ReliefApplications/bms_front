enum Color {
    aqua= '#00ffff',
    azure= '#f0ffff',
    beige= '#f5f5dc',
    black= '#000000',
    blue= '#0000ff',
    brown= '#a52a2a',
    cyan= '#00ffff',
    darkblue= '#00008b',
    darkcyan= '#008b8b',
    darkgrey= '#a9a9a9',
    darkgreen= '#006400',
    darkkhaki= '#bdb76b',
    darkmagenta= '#8b008b',
    darkolivegreen= '#556b2f',
    darkorange= '#ff8c00',
    darkorchid= '#9932cc',
    darkred= '#8b0000',
    darksalmon= '#e9967a',
    darkviolet= '#9400d3',
    fuchsia= '#ff00ff',
    gold= '#ffd700',
    green= '#008000',
    indigo= '#4b0082',
    khaki= '#f0e68c',
    lightblue= '#add8e6',
    lightcyan= '#e0ffff',
    lightgreen= '#90ee90',
    lightgrey= '#d3d3d3',
    lightpink= '#ffb6c1',
    lightyellow= '#ffffe0',
    lime= '#00ff00',
    magenta= '#ff00ff',
    maroon= '#800000',
    navy= '#000080',
    olive= '#808000',
    orange= '#ffa500',
    pink= '#ffc0cb',
    purple= '#800080',
    violet= '#800080',
    red= '#ff0000',
    silver= '#c0c0c0',
    white= '#ffffff',
    yellow= '#ffff00',
}

export class Colorizer {
    public static chooseRandomColors(colorCount: number): Array<Color> {
        let allColors = Object.values(Color);
        const pickedColors: Array<Color> = [];

        // Increase the color pool if there are too little colors.
        while (colorCount > allColors.length) {
            allColors = allColors.concat(Object.values(Color));
            console.log(allColors);
        }

        return Colorizer.chooseRandomColorsFromArray(colorCount, pickedColors, allColors);

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
}
