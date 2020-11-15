import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import { DataService } from '../data/data.service';

@Component({
  selector: 'ff-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  email;
  password;
  isLoggedIn = false;
  message;

  constructor(
    public snackBar: MatSnackBar,
    private data: DataService,
    private router: Router) { }

  ngOnInit() {
    if (!this.data.connected) {
      const strConfig = localStorage.getItem('fd-config');
      if (strConfig !== null && strConfig !== undefined) {
        const config = JSON.parse(strConfig);
        this.data.connect(config);
      } else {
        this.router.navigate(['connect']);
      }
    }
    firebase.auth().onAuthStateChanged(usr => {
      if (usr) {
        this.data.user = usr;
        // User is signed in and currentUser will no longer return null.
        this.data.connected = true;
        this.isLoggedIn = true;
      } else {
        // No user is signed in.
        this.isLoggedIn = false;
      }
    });
  }

  signIn() {
    firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(data => {
      this.data.user = data.user;
      this.router.navigate(['drill']);
    })
    .catch((error) => {
      this.snackBar.open(error.message, undefined, {
        duration: 10000,
      });
    });
  }

  signOut() {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
    });
  }

  get user() {
    return this.data.user;
  }

  googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken;
      // The signed-in user info.
      this.data.user = result.user;
      this.router.navigate(['drill']);
      // ...
    }).catch((error) => {
      this.snackBar.open(error.message, undefined, {
        duration: 10000,
      });
    });
  }
}
