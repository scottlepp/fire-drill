import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { FirestoreService} from './firestore.service';
import { map } from 'rxjs/operators';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public connected = false;
  public item;
  public path;
  public user = {};
  public type = 'realtime';
  public fieldSettings = {};

  private resultsSubject = new BehaviorSubject<any[]>([]);
  private fieldsSubject = new BehaviorSubject<any[]>([]);
  private fields: Map<string, any>;
  public fieldsList = [];

  constructor(private realtime: RealtimeService, private firestore: FirestoreService, private util: UtilService) { }

  connect(config) {
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(user => {
      // console.log(user);
      if (user) {
        this.user = user;
        // User is signed in and currentUser will no longer return null.
        this.connected = true;
        localStorage.setItem('fd-config', JSON.stringify(config));
        // this.router.navigate(['drill']);
      } else {
        // No user is signed in.
        console.log('no user');
      }
    });
    this.connected = true;
  }

  // TODO - we may need this since some results may not have all fields
  // fetchFields(list) {
  //   const ref = firebase.database().ref(list);
  //   const query = ref.limitToLast(1);
  //   query.once('value').then(snapshot => {
  //     const rows = this.snapshotToArray(snapshot);
  //     this.fields = new Map();
  //     for (const row of rows) {
  //       for (const key in row) {
  //         if (key !== 'key') {
  //           this.fields.set(key, row[key]);
  //         }
  //       }
  //     }
  //     this.fieldsSubject.next(Array.from(this.fields.keys()));
  //   });
  //   return this.fieldsSubject.asObservable();
  // }

  fetch(list, filter, limit, sort?) {
    this.path = list;
    return this.database().fetch(list, filter, limit, sort).pipe(map(results => {
      this.setFields(results);
      return this.transformResults(results);
    }));
  }

  save(item) {
    return this.database().save(item, this.path);
  }

  add(item): PromiseLike<any> {
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.key;
    const keys = Object.keys(clone);
    for (const key of keys) {
      const val = clone[key];
      if (typeof val === 'object') {
        if (val.seconds !== undefined && val.nanoseconds !== undefined && val.toDate === undefined) {
          // timestamp converted to object, make it a timestamp again
          var d = new Date(0);
          d.setUTCSeconds(val.seconds);
          clone[key] = this.getTimestamp(d);
        }
      }
    }
    return this.database().add(clone, this.path);
  }

  delete(items) {
    return this.database().delete(items, this.path);
  }

  isDateField(field) {
    if (this.fields !== undefined) {
      const val: any = this.fields.get(field);
      return this.util.isDate(val);
    } else {
      return false;
    }
  }

  saveItem(item) {
    setTimeout(() => {
      item.selected = false;
    }, 100);
    for (const field of item.editFields) {
      this.bindFormField(item.item, field);
    }
    item.fields = item.editFields;
    if (!item.$clone) {
      return this.save(item.item).then(saved => {
        item.$edit = false;
        delete item.editFields;
      });
    } else {
      return this.addItem(item);
    }
  }

  saveTableItem(item) {
    setTimeout(() => {
      item.selected = false;
    }, 100);
    for (const key in item.editFields) {
      if (true) {
        this.bindFormField(item.item, item.editFields[key]);
      }
    }
    item.fields = item.fields.map(f => Object.assign(f, item.editFields[f.name]));
    if (!item.$clone) {
      return this.save(item.item).then(saved => {
        item.$edit = false;
        delete item.editFields;
      });
    } else {
      return this.addItem(item);
    }
  }

  addAll(items) {
    return this.database().addAll(items, this.path);
  }

  addItem(item) {
    item.$clone = false;
    return this.add(item.item).then(saved => {
      item.$edit = false;
      delete item.editFields;
    });
  }

  batchUpdate(updates: Array<any>) {
    const db = firebase.firestore();
    const batch = db.batch();
    for (const update of updates) {
      const record = db.collection(update.collection).doc(update.item.key);
      const doc = {...update.item };
      delete doc.key;
      delete doc.$key;
      batch.update(record, doc);
    }
    return batch.commit();
  }

  private bindFormField(item, field) {
    if (field.isDate) {
      if (field.newValue !== undefined) {
        item[field.name] = field.newValue;
        field.value = item[field.name];  // reset back to numeric value from moment object
        if (!isNaN(field.value)) {
          // if its numeric make it a timestamp
          const date = new Date(field.value);
          item[field.name] = this.getTimestamp(date);
        }
        delete field.newValue;
      } else {
        // the date picker binding changes this value to a Date even when unchanged
        // change it back to the original numeric timestamp
        field.value = item[field.name];
      }
    } else {
      if (!field.isObject) {
        item[field.name] = this.util.getTrueValue(field.value);
      } else {
        for (const child of field.children) {
          // const childItem = item[field.name][child.name];
          this.bindFormField(item[field.name], child);
        }
      }
    }
  }

  private transformResults(results) {
    const items = [];
    for (const result of results) {
      const fields = this.getFields(result);
      items.push({item: result, fields: fields.list, map: fields.map});
    }
    return items;
  }

  public getFields(result, parent?, collection?) {
    const fieldMap = {};
    const fields = [];
    for (const key in result) {
      if (!key.startsWith('$') && key !== 'key') {
        const value = result[key];
        let field;
        if (typeof value !== 'object') {
          let isDate = this.util.isDate(result[key]);
          const isBoolean = this.util.isBoolean(result[key]);
          let isCurrency = false;
          if (this.fieldSettings[key] !== undefined) {
            isDate = this.fieldSettings[key].isDate;
            isCurrency = this.fieldSettings[key].isCurrency || false;
          }
          field = {name: key, value: result[key], isDate: isDate, isCurrency: isCurrency, parent: parent, collection: collection, isBoolean: isBoolean};
          fields.push(field);
          fieldMap[key] = field;
        } else {
          if (result.path === undefined) {
            const child = result[key];
            if (value['seconds'] !== undefined && value['nanoseconds'] !== undefined) {
              let dateValue = value;
              if (value.toDate === undefined) {
                var d = new Date(0);
                d.setUTCSeconds(value.seconds);
                dateValue = this.getTimestamp(d);
              }
              field = {name: key, value: dateValue.toDate().getTime(), isDate: true, isCurrency: false, isObject: false, parent, collection};
              fields.push(field);
              fieldMap[key] = field;
            } else if (child.path === undefined) {
              field = {name: key, value: result[key], isDate: false, isCurrency: false, isObject: true, children: this.getFields(child, key).list};
              fields.push(field);
              fieldMap[key] = field;
            } else {
              field = {name: key, value: result[key], isDate: false, isCurrency: false, isObject: true, children: [], isRef: true};
              fields.push(field);
              fieldMap[key] = field;
              // doc referenced in another collection
              // child.get().then(doc => {
              //   console.log(doc.data());
              // });
            }
          } else {
            // TODO - handle reference doc
          }
        }
      }
    }
    return {list: fields, map: fieldMap};
  }

  public getTimestamp(date) {
    return this.firestore.getTimestamp(date);
  }

  public getDeleteField() {
    return firebase.firestore.FieldValue.delete();
  }

  private setFields(list) {
    this.fields = new Map();
    for (const item of list) {
      for (const key in item) {
        if (key !== 'key') {
          this.fields.set(key, item[key]);
        }
      }
    }
    this.fieldsList = Array.from(this.fields.keys());
  }

  private database() {
    return this.type === 'realtime' ? this.realtime : this.firestore;
  }

}
