import { Injectable } from '@angular/core';
import { Households } from 'src/app/model/households.new';

@Injectable({
  providedIn: 'root'
})
export class ImportedDataService {
    /**
     * // TODO
     * @todo replace with genuine eventemitter
     */
  data: Households[];
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
