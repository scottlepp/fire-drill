import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ff-drill',
  templateUrl: './drill.component.html',
  styleUrls: ['./drill.component.scss']
})
export class DrillComponent implements OnInit {

  kind;

  constructor (
    private data: DataService,
    private router: Router) { }

  ngOnInit() {
    if (!this.data.connected) {
      const strConfig = localStorage.getItem('fd-config');
      if (strConfig !== null && strConfig !== undefined) {
        const config = JSON.parse(strConfig);
        this.data.connect(config);
        this.kind = config.type;
      } else {
        this.router.navigate(['connect']);
      }
    } else {
      const strConfig = localStorage.getItem('fd-config');
      const config = JSON.parse(strConfig);
      this.kind = config.type;
    }
  }

}
