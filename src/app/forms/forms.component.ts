import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SettingsComponent } from '../drill/settings/settings.component';
import { SettingsService } from '../settings/settings.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'ff-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {

  collection;
  item: any = {};
  keys = Object.keys;
  working = false;
  filter = {};
  fields = [];
  kind;
  show = false;
  editFields = [];

  constructor(
    private data: DataService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.data.type = 'firestore';
    if (!this.data.connected) {
      const strConfig = localStorage.getItem('fd-config');
      if (strConfig !== null && strConfig !== undefined) {
        const config = JSON.parse(strConfig);
        this.data.connect(config);
        this.kind = config.type;
      } else {
        this.router.navigate(['connect']);
      }
    } else {
      const strConfig = localStorage.getItem('fd-config');
      const config = JSON.parse(strConfig);
      this.kind = config.type;
    }
  }

  generate() {
    this.fetch();
  }

  fetch() {
    this.working = true;

    // this.data.fieldSettings = this.settings.getFieldSettings(this.path, 'fs');
    this.data.fetch(this.collection, this.filter, 1, undefined).subscribe(results => {
      // this.fieldSettings = this.settings.getFieldSettings(this.path, 'fs');
      this.item = results[0];
      // this.fields = this.data.fieldsList.length === 0 ? this.fields : this.data.fieldsList;
      this.fields = this.item.fields;
      const editFields = [];
      for (const field of this.item.fields) {
        if (!field.isRef) {
          const clone = JSON.parse(JSON.stringify(field));
          if (field.isDate) {
            if (typeof clone.value === 'string') {
              clone.value = parseInt(clone.value, 10);
            }
            clone.value = new Date(clone.value);
            editFields.push(clone);
          } else {
            editFields.push(clone);
          }
        }
      }
      this.editFields = editFields;
      this.show = true;
      this.working = false;
    }, error => {
      this.working = false;
      const snackBarRef = this.snackBar.open('Permission Denied', 'Sign In', { duration: 10000 });
      snackBarRef.onAction().subscribe(( ) => {
        this.router.navigate(['user']);
      });
    });
  }

  openSettings(): void {
    const dialogRef = this.dialog.open(SettingsComponent, {
      width: '300px',
      data: {results: [this.item], path: this.collection, kind: 'fs'}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.updateResultsDataTypes();
    });
  }

  onFocus(item) {

  }

  drop(event) {
    // this.show = false;
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    moveItemInArray(this.editFields, event.previousIndex, event.currentIndex);
    // setTimeout(() => {
    //   this.show = true;
    // }, 100);
  }

  dateChange(index, $event) {
    const dateField = this.editFields[index];
    dateField.newValue = $event.value.valueOf();
  }

  dateChangeChild(index, childIndex, $event) {
    const dateField = this.editFields[index].children[childIndex];
    dateField.newValue = $event.value.valueOf();
  }

  copy() {
    let strForm = '<form> \r\n';
    for (const field of this.fields) {
      if (!field.isDate && !field.isObject && !field.isBoolean) {
        strForm += '\t<mat-form-field> \r\n';
        strForm += '\t\t<input matInput placeholder="' + field.name + '"> \r\n';
        strForm += '\t</mat-form-field> \r\n';
      }
      if (!field.isDate && !field.isObject && field.isBoolean) {
        strForm += '\t<div> \r\n';
        strForm += '\t\t<mat-checkbox>' + field.name + '</mat-checkbox> \r\n';
        strForm += '\t</div> \r\n';
      }
      if (field.isDate) {
        strForm += '\t<mat-form-field> \r\n';
        strForm += '\t\t<input matInput [matDatepicker]="date" placeholder="' + field.name + '"> \r\n';
        strForm += '\t\t<mat-datepicker-toggle matSuffix [for]="date"></mat-datepicker-toggle> \r\n';
        strForm += '\t\t<mat-datepicker #date></mat-datepicker> \r\n';
        strForm += '\t</mat-form-field> \r\n';
      }
    }
    strForm += '</form>';

    const listener = (e: ClipboardEvent) => {
      const clipboard = e.clipboardData || window['clipboardData'];
      clipboard.setData('text', strForm);
      e.preventDefault();
    };

    document.addEventListener('copy', listener, false);
    document.execCommand('copy');
    document.removeEventListener('copy', listener, false);

    this.snackBar.open('Copied to Clipboard', undefined, {
      duration: 2000,
    });
  }

  // update the results so the date fiels show as dates
  private updateResultsDataTypes() {
    const fieldSettings = this.settings.getFieldSettings(this.collection, 'fs');
    this.data.fieldSettings = fieldSettings;
    for (const f of this.item.fields) {
      if (fieldSettings[f.name] !== undefined) {
        f.isDate = fieldSettings[f.name].isDate;
        f.isCurrency = fieldSettings[f.name].isCurrency;
        f.isBoolean = fieldSettings[f.name].isBooelan;
      }
    }
    // so a change event triggers on child components with results as an input
    // this.results = this.results.slice();
  }
}
