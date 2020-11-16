import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'ff-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {

  item = {};
  fields = [];
  datatype;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<UpdateComponent>) { }

  ngOnInit() {
  }

  add() {
    this.fields.push({name:'', datatype: 'string'})
  }

  save() {
    const fields = this.fields.filter(f => f.name !== undefined && f.name !== '');
    this.dialogRef.close({ fields });
  }

  onChangeDatatype(val, field) {
    field.datatype = val;
  }

  dateChange(field, event) {
    console.log('date change');
  }
}
