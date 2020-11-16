import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../data/data.service';

@Component({
  selector: 'ff-table-results',
  templateUrl: './table-results.component.html',
  styleUrls: ['./table-results.component.scss']
})
export class ResultsComponent implements OnInit, OnChanges {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  @Input()
  results = [];

  @Output()
  filter: EventEmitter<any> = new EventEmitter();

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  fields = [];
  fieldMap = {};
  loaded = true;
  totals = {};
  showTotals = false;

  constructor(private data: DataService) { }

  ngOnInit() {
    this.loaded = true;
    this.loadColumns();
    this.calculateTotals();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadColumns();
    this.calculateTotals();
  }

  onFilter(field) {
    if (!field.isObject) {
      this.filter.emit(field);
    }
  }

  onFieldPick(field) {
    this.loaded = false;
    setTimeout(() => {
      const displayColumns = this.fields.filter(f => f.selected).map(f => f.name);
      if (displayColumns.length > 0) {
        this.displayedColumns = displayColumns;
        this.columnsToDisplay = this.displayedColumns.slice();
      } else {
        field.selected = true;
      }
      this.loaded = true;
    }, 50);
  }

  edit(item) {
    // TODO - in case we want a full page edit
    // this.data.item = item;
    // this.router.navigate(['edit']);
    item.$edit = !item.$edit;
    const editFields = {};
    for (const field of item.fields) {
      if (!field.isRef) {
        const clone = JSON.parse(JSON.stringify(field));
        if (field.isDate) {
          if (typeof clone.value === 'string') {
            clone.value = parseInt(clone.value, 10);
          }
          clone.value = new Date(clone.value);
          editFields[field.name] = clone;
        } else {
          editFields[field.name] = clone;
        }
      }
    }
    item.editFields = editFields;
    setTimeout(() => {
      item.selected = false;
    }, 100);
  }

  dateChange(item, field, $event) {
    const dateField = item.editFields[field];
    dateField.newValue = $event.value.valueOf();
  }

  dateChangeChild(item, index, childIndex, $event) {
    const dateField = item.editFields[index].children[childIndex];
    dateField.newValue = $event.value.valueOf();
  }

  onFocus(item) {
    setTimeout(() => {
      item.selected = false;
    }, 100);
  }

  save(item) {
    this.data.saveTableItem(item).then(() => {
      this.filter.emit();
    });
  }

  cancel(item) {
    item.$edit = false;
    delete item.editFields;
    setTimeout(() => {
      item.selected = false;
    }, 100);
  }

  private loadColumns() {
    const row = this.results[0];
    this.displayedColumns = [];
    this.fields = [];
    for (const field of row.fields) {
      // if (!field.isObject) {
        this.displayedColumns.push(field.name);
        const clone = Object.assign({selected: true}, field);
        this.fields.push(clone);
        this.fieldMap[field.name] = clone;
      // }
    }
    this.columnsToDisplay = this.displayedColumns.slice();
  }

  private async calculateTotals() {
    this.totals = {};
    for (const result of this.results) {
      const item = result.item;
      for (const key in item) {
        if (this.fieldMap[key] !== undefined && !this.fieldMap[key].isDate) {
          if (item[key] !== undefined && !isNaN(item[key])) {
            this.totals[key] = this.totals[key] || 0;
            this.totals[key] += item[key];
          }
        }
      }
    }
  }
}
