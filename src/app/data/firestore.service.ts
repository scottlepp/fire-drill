import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { BehaviorSubject, Subject } from 'rxjs';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private resultsSubject = new Subject<any[]>();
  // private fields: Map<string, any>;
  private fieldSettings = {};
  // public fieldsList = [];

  constructor(private util: UtilService) { }

  fetch(path, filter, limit, sort?) {
    this.resultsSubject = new Subject<any[]>();
    const collection = this.getCollection(path);
    let query = this.applyFilter(filter, collection);
    if (sort !== undefined) {
      query = query.orderBy(sort.name, sort.direction);
    }
    query.limit(limit).get().then(snapshot => {
      const list = this.snapshotToArray(snapshot);
      // this.setFields(list);
      this.resultsSubject.next(list);
    }, error => {
      console.error('ON SNAPSHOT ' + error);
      this.resultsSubject.error(error);
    });
    // query.limit(limit).onSnapshot(snapshot => {
    //   const list = this.snapshotToArray(snapshot);
    //   // this.setFields(list);
    //   this.resultsSubject.next(list);
    // }, error => {
    //   console.error('ON SNAPSHOT ' + error);
    //   this.resultsSubject.error(error);
    // });
    return this.resultsSubject.asObservable();
  }

  add(item, path) {
    const collection = this.getCollection(path);
    return collection.doc().set(item);
  }

  save(item, path) {
    const collection = this.getCollection(path);
    return collection.doc(item.key).set(item);
  }

  delete(items, path) {
    const firestore = firebase.firestore();
    const collection = this.getCollection(path);
    const batch = firestore.batch();
    for (const item of items) {
      batch.delete(collection.doc(item.item.key));
    }
    return batch.commit();
    // return collection.doc(item.key).delete().then(function() {
    //   console.log('Document successfully deleted!');
    // }).catch(function(error) {
    //     console.error('Error removing document: ', error);
    // });
  }

  addAll(items, path): Promise<void> {
    const firestore = firebase.firestore();
    const collection = this.getCollection(path);
    const batch = firestore.batch();
    for (const item of items) {
      const doc = collection.doc();
      batch.set(doc, item);
    }
    return batch.commit().then(success => {
    }, error => {
      console.log(error);
    });
  }

  private getCollection(path) {
    const firestore = firebase.firestore();
    // const settings = {/* your settings... */ timestampsInSnapshots: true};
    // firestore.settings(settings);
    return firestore.collection(path);
  }

  // private setFields(list) {
  //   this.fields = new Map();
  //   for (const item of list) {
  //     for (const key in item) {
  //       if (key !== 'key') {
  //         this.fields.set(key, item[key]);
  //       }
  //     }
  //   }
  //   this.fieldsList = Array.from(this.fields.keys());
  // }

  private applyFilter(filter, collection) {
    if (filter.field !== undefined) {
      let filterValue = this.util.getTrueValue(filter.val);
      if (filter.isDate) {
        filterValue = new Date(filterValue);
      }
      if (filter.oper === 'eq' && !filter.isDate) {
        return collection.where(filter.field, '==', filterValue);
      } else if (filter.oper === 'bt' || (filter.oper === 'eq' && filter.isDate)) {
        const endValue = this.util.getTrueValue(filter.val2);
        return collection.where(filter.field, '>=', filterValue).where(filter.field, '<=', endValue);
      } else if (filter.oper === 'gt') {
        return collection.where(filter.field, '>', filterValue);
      } else if (filter.oper === 'lt') {
        return collection.where(filter.field, '<', filterValue);
      }
    } else {
      return collection;
    }
  }

  private snapshotToArray(snapshot) {
    const returnArr = [];
    snapshot.forEach(doc => {
        const item = doc.data();
        item.key = doc.id;
        returnArr.push(item);
    });
    return returnArr;
  }

  // private transformResults(results) {
  //   const items = [];
  //   for (const result of results) {
  //     const fields = [];
  //     for (const key in result) {
  //       if (!key.startsWith('$') && key !== 'key') {
  //         const value = result[key];
  //         if (typeof value !== 'object') {
  //           let isDate = this.isDate(result[key]);
  //           if (this.fieldSettings[key] !== undefined) {
  //             isDate = this.fieldSettings[key].isDate;
  //           }
  //           fields.push({name: key, value: result[key], isDate: isDate});
  //         } else {
  //           fields.push({name: key, value: result[key], isDate: false, isObject: true});
  //         }
  //       }
  //     }
  //     items.push({item: result, fields: fields});
  //   }
  //   return items;
  // }

  // isDateField(field) {
  //   const val: any = this.fields.get(field);
  //   return this.isDate(val);
  // }

  // isDate(val) {
  //   if (!isNaN(val) && val.toString().indexOf('.') === -1) {
  //     return val.toString().length === 13;
  //   } else {
  //     return false;
  //   }
  // }

  // getTrueValue(val) {
  //   if (!isNaN(val) && typeof val !== 'number') {
  //     if (val.includes('.')) {
  //       return parseFloat(val);
  //     } else {
  //       return parseInt(val, 10);
  //     }
  //   } else {
  //     return val;
  //   }
  // }

  // getFieldSettings(path, kind) {
  //   const fields = localStorage.getItem(path + '-' + kind + '-fields');
  //   if (fields !== undefined && fields !== null) {
  //     const fieldsArray = JSON.parse(fields);
  //     for (const f of fieldsArray) {
  //       this.fieldSettings[f.name] = f;
  //     }
  //   }
  // }
}
