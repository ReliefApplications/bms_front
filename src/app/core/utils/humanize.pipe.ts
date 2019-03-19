import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'humanize'
})

export class HumanizePipe implements PipeTransform {
    transform(value: string) {
        if ((typeof value) !== 'string') {
            return value;
        }
        let response = '';
        const values = value.split(/(?=[A-Z])/);
        values.forEach(part => {
            const word = part[0].toUpperCase() + part.slice(1);
            response += word + ' ';
        });
        return response;
    }
}
