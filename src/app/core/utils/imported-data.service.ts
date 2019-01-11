import {Injectable, Output, EventEmitter} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportedDataService {

  @Output() fire: EventEmitter<any> = new EventEmitter();

  data: any;

   constructor() {
     console.log('shared service started');
   }

   redirectToProject(project: any) {
     console.log(typeof(project))
     this.fire.emit(project);
   }

   getEmittedValue() {
     return this.fire;
   }
}
