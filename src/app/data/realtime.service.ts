import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { BehaviorSubject, Subject, forkJoin, Observable } from 'rxjs';
import { UtilService } from './util.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {

  private resultsSubject = new Subject<any[]>();

  constructor(private util: UtilService) { }

  fetch(list, filter, limit, sort?) {
    this.resultsSubject = new Subject<any[]>();
    const ref = firebase.database().ref(list);
    let query;
    if (filter.field !== undefined) {
      const filterValue = this.util.getTrueValue(filter.val);
      if (filter.oper === 'eq' && !filter.isDate) {
        query = ref.orderByChild(filter.field)
        .equalTo(filterValue)
        .limitToLast(limit);
      } else if (filter.oper === 'bt' || (filter.oper === 'eq' && filter.isDate)) {
        const endValue = this.util.getTrueValue(filter.val2);
        query = ref.orderByChild(filter.field)
        .limitToLast(limit)
        .startAt(filterValue)
        .endAt(endValue);
      } else if (filter.oper === 'gt') {
        query = ref.orderByChild(filter.field)
        .startAt(filterValue)
        .limitToLast(limit);
      } else if (filter.oper === 'lt') {
        query = ref.orderByChild(filter.field)
        .limitToLast(limit)
        .endAt(filterValue);
      }
    } else {
      query = ref.limitToLast(limit);
    }

    query.once('value').then(snapshot => {
      // console.log(snapshot.val());
      this.resultsSubject.next(this.snapshotToArray(snapshot));
    }, error => {
      console.error('REALTIME query failed ' + error);
      return this.resultsSubject.error(error);
    });
    return this.resultsSubject.asObservable();
  }

  save(item, path) {
    const clone = JSON.parse(JSON.stringify(item));
    delete clone.key;
    const ref = firebase.database().ref();
    const updates = {};
    updates['/' + path + '/' + item.key] = clone;
    return firebase.database().ref().update(updates).then(value => {
      console.log('saved');
    }, err => {
      console.log('save failed');
    });
  }

  add(item, path) {
    const ref = firebase.database().ref(path);
    return ref.push(item).then(success => {
      console.log('added');
      }, error => {
        console.error(error);
      });
  }

  delete(items, path) {
    const updates = {};
    for (const item of items) {
      updates['/' + path + '/' + item.item.key] = null;
    }
    return firebase.database().ref().update(updates).then(value => {
      console.log('deleted');
    }, err => {
      console.log('delete failed');
    });
  }

  addAll(items, path): Promise<void> {
    const adds = [];
    for (const item of items) {
      adds.push(this.add(item, path));
    }
    // forkjoin returns array, map to object
    return forkJoin(adds).pipe(map(() => {})).toPromise();
  }

  private snapshotToArray(snapshot) {
    const returnArr = [];
    snapshot.forEach(childSnapshot => {
        const item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
    });
    return returnArr;
  }
}
