import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportedDataService {

  data: any;
  project: any;
  emittedProject = false;

   constructor() {
   }

   redirectToProject(project: any) {
     this.emittedProject = true;
     this.project = project;
   }

   getEmittedValue(): string {
     if (this.emittedProject) {
       return this.project;
     }
   }
}
