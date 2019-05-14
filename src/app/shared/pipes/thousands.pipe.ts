import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousands'
})
export class ThousandsPipe implements PipeTransform {


  transform(value: number): string {
    const parsedString = String(value);
    const reverted = this.revertString(parsedString);
    const split = this.splitIntoThreeElementsString(reverted);
    const assembled = this.assembleString(split);
    const output = this.revertString(assembled);
    return output;
  }

  revertString(toRevert: string): string {
    return toRevert.split('').reverse().join('');
  }

  splitIntoThreeElementsString(toSplit: string): string[] {
    return toSplit.match(/.{1,3}/g);
  }

  assembleString(toAssemble): string {
    return toAssemble.join(',');
  }

}
