import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'ff-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  item = {};
  keys = Object.keys;

  constructor(private data: DataService, private router: Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.item = this.data.item || {};
  }

  save() {
    this.data.save(this.item).then(val => {
      this.snackBar.open('Item Saved!', undefined, {
        duration: 2000,
      });
    });
  }
}
