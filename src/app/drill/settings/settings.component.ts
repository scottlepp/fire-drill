import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'ff-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  fields = [];
  path;
  kind;
  changed = false;
  currency = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.path = this.data.path;
    this.kind = this.data.kind || 'rt';
    if (this.data.results.length > 0) {
      const fields = this.data.results[0].fields;
      const stored = this.getStored();
      for (const field of fields) {
        if (this.isInteger(field.value) && field.value.toString().length > 10) {
          const isDate = stored[field.name] !== undefined ? stored[field.name].isDate : field.isDate;
          this.fields.push({name: field.name, isDate: isDate});
        } else if (!isNaN(field.value) && !field.isBoolean) {
          const isCurrency = stored[field.name] !== undefined ? stored[field.name].isCurrency : field.isCurrency;
          this.currency.push({name: field.name, isCurrency: isCurrency});
        }
      }
      this.path = this.data.path;
    }
  }

  getStored() {
    const fields = localStorage.getItem(this.path + '-' + this.kind +  '-fields') || '[]';
    const fieldList = JSON.parse(fields);
    return fieldList.reduce((o, v) => Object.assign(o, {[v.name]: v}), {});
  }

  onChange() {
    const fields = [...this.fields, ...this.currency];
    localStorage.setItem(this.path + '-' + this.kind + '-fields', JSON.stringify(fields));
    this.changed = true;
  }

  isInteger(val) {
    return (!isNaN(val) && val.toString().indexOf('.') === -1);
  }
}
