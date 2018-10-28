import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import * as mom from 'moment';
import { MatDialog } from '@angular/material';
import { SettingsComponent } from '../drill/settings/settings.component';
import { CsvService } from '../data/csv.service';
import { UtilService } from '../data/util.service';
import { SettingsService } from '../settings/settings.service';
import { MatSnackBar } from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'ff-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit {

  fields = [];
  filter = {field: undefined, oper: 'eq', val: undefined, val2: undefined, isDate: false, dateVal: undefined};
  results = [];
  path;
  limit = '10';
  working = false;
  fieldSettings = {};
  selected = [];

  constructor (
    private data: DataService,
    public dialog: MatDialog,
    private csv: CsvService,
    public snackBar: MatSnackBar,
    private router: Router,
    private settings: SettingsService) { }

  ngOnInit() {
    this.data.type = 'realtime';
  }

  doFilter() {
    this.fetch();
  }

  onFilter(field) {
    if (field !== undefined) {
      this.filter.field = field.name;
      if (field.parent !== undefined) {
        this.filter.field = field.parent + '/' + field.name;
        if (!this.fields.includes(this.filter.field)) {
          this.fields.push(this.filter.field);
        }
      }
      this.filter.val = field.value;
      this.filter.oper = 'eq';
      let isDate = field.isDate;
      if (this.fieldSettings[field.name] !== undefined) {
        isDate = this.fieldSettings[field.name].isDate;
      }
      if (isDate) {
        const moment = mom(field.value);
        const start = moment.startOf('day');
        this.filter.val = start.valueOf();
        const end = moment.endOf('day');
        this.filter.val2 = end.valueOf();
        this.filter.dateVal = new Date(field.value);
      }
    }
    this.doFilter();
  }

  dateChange(kind, $event) {
    // for date eq to work we need SOD to EOD
    if (this.filter.oper === 'eq') {
      const moment = $event.value;
      const start = moment.startOf('day');
      this.filter.val = start.valueOf();
      const end = moment.endOf('day');
      this.filter.val2 = end.valueOf();
    } else {
      this.filter[kind] = $event.value.valueOf();
    }
  }

  drill() {
    this.fetch();
  }

  openSettings(): void {
    const dialogRef = this.dialog.open(SettingsComponent, {
      width: '300px',
      data: {results: this.results, path: this.path}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.updateResultsDataTypes();
      const filterField = this.fieldSettings[this.filter.field];
      if (filterField !== undefined) {
        this.filter.isDate = filterField.isDate;
      }
    });
  }

  clear() {
    this.filter = {field: undefined, oper: 'eq', val: '', val2: '', isDate: false, dateVal: undefined};
    this.fetch();
  }

  onChangeFilter(field) {
    this.filter.val = '';
    this.filter.val2 = '';
    this.filter.oper = 'eq';
    this.filter.isDate = this.data.isDateField(field);
    if (this.fieldSettings[field] !== undefined) {
      this.filter.isDate = this.fieldSettings[field].isDate;
    }
  }

  onChangeLimit(val) {
    this.fetch();
  }

  fetch() {
    this.working = true;
    const limit = parseInt(this.limit, 10);
    this.data.fetch(this.path, this.filter, limit).subscribe(results => {
      this.fieldSettings = this.settings.getFieldSettings(this.path, 'rt');
      this.fields = this.data.fieldsList.length === 0 ? this.fields : this.data.fieldsList;
      if (!this.fields.includes(this.filter.field)) {
        this.fields.push(this.filter.field);
      }
      this.results = results;
      this.working = false;
    }, error => {
      this.working = false;
      const snackBarRef = this.snackBar.open('Permission Denied', 'Sign In', { duration: 10000 });
      snackBarRef.onAction().subscribe(( ) => {
        this.router.navigate(['user']);
      });
    });
    // this.data.fetchFields(this.path).subscribe(fields => {
    //   this.fields = fields;
    // });
  }

  export() {
    this.csv.export(this.results);
  }

  importSelected(files: FileList) {
    if (files && files.length > 0) {
      const file: File = files.item(0);
        const reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          const csv: any = reader.result;
          this.doImport(csv);
        };
    }
  }

  onSelect(selected) {
    this.selected = selected;
  }

  delete() {
    this.data.delete(this.selected).then(() => {
      this.selected = [];
      this.fetch();
    });
  }

  private doImport(csv) {
    const items = this.csv.toJson(csv);
    // for (const item of items) {
    //   this.data.add(item);
    // }
    this.data.addAll(items).then(() => {
      this.fetch();
    });
  }

  // update the results so the date fiels show as dates
  private updateResultsDataTypes() {
    this.fieldSettings = this.settings.getFieldSettings(this.path, 'rt');
    for (const item of this.results) {
      for (const f of item.fields) {
        if (this.fieldSettings[f.name] !== undefined) {
          f.isDate = this.fieldSettings[f.name].isDate;
        }
      }
    }
  }
}
