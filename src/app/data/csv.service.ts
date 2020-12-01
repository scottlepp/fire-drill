import { Injectable } from '@angular/core';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor(private util: UtilService) { }

  export(results) {
    const link = document.createElement('a');
    const csv = this.toCsv(results);

    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'results.csv');
        // link.style = 'visibility:hidden';
    }

    if (navigator.msSaveBlob) { // IE 10+
      link.addEventListener('click', function (event) {
        const blob = new Blob([csv], {
          'type': 'text/csv;charset=utf-8;'
        });
      navigator.msSaveBlob(blob, 'results.csv');
      }, false);
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  toCsv(results) {
    const items = results;
    const replacer = (key, val) => val === null ? '' : val; // specify how you want to handle null values here

    const byMostFields = items.sort((a, b) => {
      return b.fields.length - a.fields.length;
    });

    const fields = [{name: '$key'}, ...byMostFields[0].fields];

    let value;
    const csv = items.map(row =>
      fields.map(field => {
        if (field.name === '$key') {
          return row.item.key;
        }
        value = row.item[field.name];
        if (value !== undefined && value.seconds !== undefined && value.nanoseconds !== undefined) {
          return value.seconds;
        }
        return JSON.stringify(value, replacer);
      }
      ).join(',')
    );
    const columnNames = [];
    for (const col of fields) {
      columnNames.push(col.name);
    }
    csv.unshift(columnNames.join(','));
    return csv.join('\r\n');
  }

  toJson(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

    lines.map((line, indexLine) => {
      if (indexLine < 1 || line === '') { return; } // Jump header line

      const obj = {};
      const currentline = line.split(',');

      headers.map((header, indexHeader) => {
        header = header.replace(/\r/g, '');
        obj[header] = this.format(currentline[indexHeader]);
      });

      result.push(obj);
    });

    return result;
  }

  private format(item) {
    let formatted = item;
    if (item !== undefined) {
      formatted = this.util.getTrueValue(formatted.replace(/"/g, ''));
    }
    return formatted;
  }

}
