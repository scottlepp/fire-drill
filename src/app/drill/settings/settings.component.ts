import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'ff-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  fields = [];
  path;
  changed = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data.results.length > 0) {
      const fields = this.data.results[0].fields;
      for (const field of fields) {
        if (this.isInteger(field.value)) {
          this.fields.push({name: field.name, isDate: field.isDate});
        }
      }
      this.path = this.data.path;
    }
  }

  onChange() {
    localStorage.setItem(this.path + '-fields', JSON.stringify(this.fields));
    this.changed = true;
  }

  isInteger(val) {
    return (!isNaN(val) && val.toString().indexOf('.') === -1);
  }
}
