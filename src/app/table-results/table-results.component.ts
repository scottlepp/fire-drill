import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataService } from '../data/data.service';

@Component({
  selector: 'ff-table-results',
  templateUrl: './table-results.component.html',
  styleUrls: ['./table-results.component.scss']
})
export class ResultsComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  @Input()
  results = [];

  @Output()
  filter: EventEmitter<any> = new EventEmitter();

  displayedColumns: string[] = [];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  fields = [];
  loaded = true;

  constructor(private data: DataService) { }

  ngOnInit() {

    this.loaded = true;
    const row = this.results[0];
    this.displayedColumns = [];
    for (const field of row.fields) {
      // if (!field.isObject) {
        this.displayedColumns.push(field.name);
        const clone = Object.assign({selected: true}, field);
        this.fields.push(clone);
      // }
    }
    this.columnsToDisplay = this.displayedColumns.slice();
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
}
