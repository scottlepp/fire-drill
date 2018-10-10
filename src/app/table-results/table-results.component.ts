import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { ResultsDataSource } from './table-results-datasource';

@Component({
  selector: 'ff-table-results',
  templateUrl: './table-results.component.html',
  styleUrls: ['./table-results.component.css']
})
export class ResultsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: ResultsDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  // displayedColumns = ['id', 'name'];

  displayedColumns: string[] = ['amount', 'county'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  ngOnInit() {
    this.dataSource = new ResultsDataSource(this.paginator, this.sort);

    this.dataSource.connect().subscribe(data => {
      const row = data[0];
      this.displayedColumns = [];
      for (const key in row) {
        if (true) {
          this.displayedColumns.push(key);
        }
      }
      this.columnsToDisplay = this.displayedColumns.slice();
    });
  }
}
