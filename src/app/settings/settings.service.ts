import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  getFieldSettings(path, kind) {
    const fieldSettings = {};
    const fields = localStorage.getItem(path + '-' + kind + '-fields');
    if (fields !== undefined && fields !== null) {
      const fieldsArray = JSON.parse(fields);
      for (const f of fieldsArray) {
        fieldSettings[f.name] = f;
      }
    }
    return fieldSettings;
  }

}
