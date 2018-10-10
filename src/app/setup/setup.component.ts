import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { DataService } from '../data/data.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ff-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {

  config: any = {type: 'firestore'};
  message;
  selected = 0;
  json;

  constructor(private data: DataService, private router: Router) { }

  ngOnInit() {
    const config = localStorage.getItem('fd-config');
    if (config !== undefined && config != null) {
      const kind = this.config.type;
      this.config = JSON.parse(config);
      this.config.type = this.config.type || kind;
    }
  }

  tabChanged($event) {
    this.selected = $event;
  }

  connect() {
    if (this.selected === 1) {
      this.getConfigFromJson();
    }
    try {
      this.message = undefined;
      firebase.initializeApp(this.config);
      firebase.auth().onAuthStateChanged(user => {
        // console.log(user);
        if (user) {
          this.data.user = user;
          // User is signed in and currentUser will no longer return null.
          this.data.connected = true;
          localStorage.setItem('fd-config', JSON.stringify(this.config));
          this.router.navigate(['drill']);
        } else {
          // No user is signed in.
          console.log('no user');
          this.data.connected = true;
          localStorage.setItem('fd-config', JSON.stringify(this.config));
          this.router.navigate(['user']);
        }
      });
    } catch (err) {
      this.message = 'Error - Connect failed.';
      if (err.code === 'app/duplicate-app') {
        // this.message = 'Already connected! Start drilling!';
        this.data.connected = true;
        localStorage.setItem('fd-config', JSON.stringify(this.config));
        this.router.navigate(['drill']);
      }
    }
  }

  getConfigFromJson() {
    let config = this.json;
    config = config.replace('var config = ', '').replace(';', '');
    config = config.replace(/([A-z]*)(:)/g, '"$1":').replace(/'/g, '\"');
    config = config.replace('"https"', 'https');
    const kind = this.config.type;
    this.config = JSON.parse(config);
    this.config.type = kind;
  }
}
