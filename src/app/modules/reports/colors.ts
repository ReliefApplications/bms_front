enum Color {
    $bms_black = '#132F30',
    $bms_grey= '#F1F1FB',
    $bms_dark_blue= '#02617F',
    $bms_green= '#4AA896',
    $bms_dark_grey= '#585A5E',
    $bms_white=  '#FBFCFC',
    $bms_slate= '#979B9E',
    $bms_light_blue= '#51C9DF',
    $bms_red= '#DC3D49',
    $menu_select_color= '#A6F2F9',
    $menu_select_bg= '#134252',
    $bms_highlight= '#FBFD8D',
    $bms_neutral_grey= '#c5c5ce',
    }

export class Colorizer {
    public static chooseRandomColors(colorCount: number): Array<Color> {
        let allColors = Object.values(Color);
        const pickedColors: Array<Color> = [];

        // Increase the color pool if there are too little colors.
        while (colorCount > allColors.length) {
            allColors = allColors.concat(Object.values(Color));
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
