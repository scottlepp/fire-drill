import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data/data.service';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'ff-card-results',
  templateUrl: './card-results.component.html',
  styleUrls: ['./card-results.component.scss']
})
export class CardResultsComponent implements OnInit {

  @Input()
  results = [];

  @Output()
  filter: EventEmitter<any> = new EventEmitter();

  @Output()
  selected: EventEmitter<any> = new EventEmitter();

  items = [];
  keys = Object.keys;

  constructor(private data: DataService, private router: Router) { }

  ngOnInit() {
  }

  onFilter(field) {
    if (!field.isObject) {
      this.filter.emit(field);
    }
  }

  onSelect(item, target) {
    if (['DIV', 'MAT-CARD'].includes(target.tagName)) {
      item.selected = !item.selected;
      this.selected.emit(this.results.filter(r => r.selected));
    }
  }

  edit(item) {
    // TODO - in case we want a full page edit
    // this.data.item = item;
    // this.router.navigate(['edit']);
    item.$edit = !item.$edit;
    const editFields = [];
    for (const field of item.fields) {
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
    item.editFields = editFields;
    setTimeout(() => {
      item.selected = false;
    }, 100);
  }

  dateChange(item, index, $event) {
    const dateField = item.editFields[index];
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
    this.data.saveItem(item).then(() => {
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

  clone(item) {
    const clone = JSON.parse(JSON.stringify(item));
    clone.$clone = true;
    this.edit(clone);
    this.results.push(clone);
    setTimeout(() => {
      item.selected = false;
    }, 100);
  }

  add(item) {
    this.data.addItem(item);
  }

  drillDown(field) {
    // console.log(item.value);
    const docRef = field.value;
    const collection = docRef.parent.path;
    docRef.get().then( doc => {
      const data = doc.data();
      const fields = this.data.getFields(data, undefined, collection);
      field.children = fields;
      field.drilled = true;
    });
  }
}
