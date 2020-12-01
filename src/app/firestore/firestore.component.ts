import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { DataService } from '../data/data.service';
import { CsvService } from '../data/csv.service';
import { SettingsService } from '../settings/settings.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsComponent } from '../drill/settings/settings.component';
import * as mom from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import { UpdateComponent } from '../edit/update/update.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'ff-firestore',
  templateUrl: './firestore.component.html',
  styleUrls: ['./firestore.component.scss']
})
export class FirestoreComponent implements OnInit {

  results = [];
  events: string[] = [];
  opened: boolean;
  fields = [];
  filter = {field: undefined, oper: 'eq', val: undefined, val2: undefined, isDate: false, dateVal: undefined};
  path;
  limit = '10';
  working = false;
  selected = [];
  fieldSettings = {};
  sort = {show: false, fields: []};
  view = {show: false, value: 'card', types: [{name: 'card', selected: false}, {name: 'table', selected: false}]};
  options = {show: false};
  textFilter: string;
  filters = [];

  constructor(
    private data: DataService,
    private csv: CsvService,
    private settings: SettingsService,
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    private router: Router,
    private eRef: ElementRef) { }

  ngOnInit() {
    this.data.type = 'firestore';
  }

  drill() {
    this.fetch();
  }

  onChangeLimit(val) {
    this.fetch();
  }

  fetch() {
    this.working = true;
    this.parseFilter();
    const limit = parseInt(this.limit, 10);
    const sortField = this.sort.fields.find(f => f.selected);
    this.data.fieldSettings = this.settings.getFieldSettings(this.path, 'fs');
    const filter = this.filters.length > 0 ? this.filters : this.filter;
    this.data.fetch(this.path, filter, limit, sortField).subscribe(results => {
      this.fieldSettings = this.settings.getFieldSettings(this.path, 'fs');
      const sortedFields = results.map(res => {
        res.fields = res.fields.sort(function(a, b) {
          if(a.name < b.name) { return -1; }
          if(a.name > b.name) { return 1; }
          return 0;
        });
        return res;
      });
      this.results = sortedFields;
      this.fields = this.data.fieldsList.length === 0 ? this.fields : this.data.fieldsList;
      if (!this.fields.includes(this.filter.field)) {
        this.fields.push(this.filter.field);
      }
      const selectedSort = this.sort.fields.find(f => f.selected);
      this.sort.fields = this.fields.map(f => {
        return {name: f, selected: false, direction: undefined};
      });
      if (selectedSort !== undefined) {
        const checkSelected = this.sort.fields.find(f => f.name === selectedSort.name);
        if (checkSelected === undefined) {
          this.sort.fields.push(selectedSort);
        } else {
          checkSelected.selected = true;
          checkSelected.direction = selectedSort.direction;
        }
      }

      this.working = false;
    }, error => {
      this.working = false;
      const snackBarRef = this.snackBar.open('Error', error.message, { duration: 10000 });
      snackBarRef.onAction().subscribe(( ) => {
        this.router.navigate(['user']);
      });
    });
  }

  parseFilter() {
    let parts = [];
    let op = 'or';
    if (this.textFilter) {
      let conj = 'AND';
      let hasConj = this.textFilter.includes('AND');
      if (!hasConj) {
        conj = 'and';
      }
      parts = this.textFilter.split(conj);
      const filters = [];
      for (const part of parts) {
        const fp = part.trim().split(' ');
        const filter = {field: fp[0], oper: fp[1], val: fp[2], val2: undefined, isDate: false, dateVal: undefined}
        filters.push(filter);
      }
      if (this.filter.field !== undefined) {
        filters.push(this.filter);
      }
      this.filters = filters;
    }
  }

  clearTextFilter() {
    this.textFilter = undefined;
    this.filters = [];
    this.fetch();
  }

  toggleView() {
    this.view.show = !this.view.show;
  }

  toggleSort() {
    this.sort.show = !this.sort.show;
  }

  toggleOptions() {
    this.options.show = !this.options.show;
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.innerText !== 'Sort') {
      if (this.sort.show) {
        this.sort.show = false;
      }
    }
    if (event.target.innerText !== 'View') {
      if (this.view.show) {
        this.view.show = false;
      }
    }
    if (event.target.innerText !== 'more_vert') {
      if (this.options.show) {
        this.options.show = false;
      }
    }
  }

  switchView(view) {
    this.view.value = view.name;
    for (const v of this.view.types) {
      v.selected = v.name === view.name;
    }
  }

  doSort(field) {
    for (const f of this.sort.fields) {
      f.selected = f.name === field.name;
    }
    field.selected = true;
    if (field.direction === undefined) {
      field.direction = 'asc';
    } else {
      field.direction = field.direction === 'asc' ? 'desc' : 'asc';
    }

    this.fetch();
  }

  doFilter() {
    this.fetch();
  }

  onFilter(field) {
    if (field !== undefined) {
      if (field.collection !== undefined) {
        this.path = field.collection;
      }
      this.filter.field = field.name;
      if (field.parent !== undefined) {
        this.filter.field = field.parent + '.' + field.name;
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
      this.filter.isDate = isDate;
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

  clear() {
    this.filter = {field: undefined, oper: 'eq', val: '', val2: '', isDate: false, dateVal: undefined};
    this.fetch();
  }

  onChangeFilter(field) {
    this.filter = Object.assign(this.filter, {val: '', val2: '', oper: 'eq'}); // reset
    this.filter.isDate = this.data.isDateField(field);
    const fieldSettings = this.settings.getFieldSettings(this.path, 'fs');
    if (fieldSettings[field] !== undefined) {
      this.filter.isDate = fieldSettings[field].isDate;
    }
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

  export() {
    this.options.show = false;
    this.csv.export(this.results);
  }

  importSelected(files: FileList) {
    this.options.show = false;
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

  print() {
    this.options.show = false;
    setTimeout(() => {
      window.print();
    }, 50);
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

  update() {
    const dialogRef = this.dialog.open(UpdateComponent, {
      width: '600px',
      data: {results: this.results, path: this.path, kind: 'fs'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.fields === undefined) {
        return;
      }
      const fields = result.fields;
      if (fields.length > 0) {
        this.doUpdateResults(fields).then(() => {
          this.fetch();
        })
      }
    });
  }

  doUpdateResults(fields: Array<any>) {
    for (const f of fields) {
      if (f.datatype === 'integer') {
        f.value = parseInt(f.value, 10);
      } else if (f.datatype === 'float') {
        f.value = parseFloat(f.value);
      } else if (f.datatype === 'date') {
        f.value = this.data.getTimestamp(f.value.toDate());
      }
    }
    const updates = this.results.map(r => {
      r.collection = this.path;
      const item = r.item;
      for (const f of fields) {
        item[f.name] = f.value;
        if (f.value == undefined) {
          item[f.name] = this.data.getDeleteField();
        }
      }
      return r;
    });
    return this.data.batchUpdate(updates);
  }

  openSettings(): void {
    const dialogRef = this.dialog.open(SettingsComponent, {
      width: '300px',
      data: {results: this.results, path: this.path, kind: 'fs'}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.updateResultsDataTypes();
      const filterField = this.fieldSettings[this.filter.field];
      if (filterField !== undefined) {
        this.filter.isDate = filterField.isDate;
      }
    });
  }

  // update the results so the date fiels show as dates
  private updateResultsDataTypes() {
    this.fieldSettings = this.settings.getFieldSettings(this.path, 'fs');
    this.data.fieldSettings = this.fieldSettings;
    for (const item of this.results) {
      for (const f of item.fields) {
        if (this.fieldSettings[f.name] !== undefined) {
          f.isDate = this.fieldSettings[f.name].isDate;
          f.isCurrency = this.fieldSettings[f.name].isCurrency;
        }
      }
    }
    // so a change event triggers on child components with results as an input
    this.results = this.results.slice();
  }

  private doImport(csv) {
    const items = this.csv.toJson(csv);
    if (items.length > 0) {
      const item = items[0];
      if (item.$key !== undefined) {
        const updates = items.map(item => {
          // fix boolean values and remove crlf
          const keys = Object.keys(item);
          for (const key of keys) {
            let val = item[key];
            if (val !== undefined && typeof val === 'string') {
              val = val.replace(/(\r\n|\n|\r)/gm, "");
            }
            if (val === 'TRUE') {
              item[key] = true;
            } else {
              item[key] = val;
            }
          }
          return {
            collection: this.path,
            item: {...item, key: item.$key},
          }
        });
        this.data.batchUpdate(updates).then(() => {
          this.fetch();
        });
      } else {
        this.data.addAll(items).then(() => {
          this.fetch();
        });
      }
    }
  }

}
