import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  // isDateField(field) {
  //   if (this.fields !== undefined) {
  //     const val: any = this.fields.get(field);
  //     return this.isDate(val);
  //   } else {
  //     return false;
  //   }
  // }

  isDate(val) {
    if (!isNaN(val) && val.toString().indexOf('.') === -1) {
      const len = val.toString().length;
      return len > 10;
    } else {
      return false;
    }
  }

  getTrueValue(val) {
    if (!isNaN(val) && typeof val !== 'number') {
      if (val.includes('.')) {
        return parseFloat(val);
      } else {
        return parseInt(val, 10);
      }
    } else {
      return val;
    }
  }

}
