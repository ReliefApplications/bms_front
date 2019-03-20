import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uppercaseFirst'
})
export class UppercaseFirstPipe implements PipeTransform {


  transform(value: string): string {
    const words = value.split(' ');
    let response = '';
    words.forEach(word => {
        word = word[0].toUpperCase() + word.slice(1);
        response += word + ' ';
    });
    return response;
  }
}
