import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SetupComponent } from './setup/setup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule, MatSelectModule, MatExpansionModule, MatInputModule, MatProgressBarModule, MatSnackBarModule, MatDatepickerModule, MatTooltipModule, MatCheckboxModule, MatDialogModule, MatTabsModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { ResultsComponent } from './table-results/table-results.component';
import { CardResultsComponent } from './card-results/card-results.component';
import { FormsModule } from '@angular/forms';
import { DrillComponent } from './drill/drill.component';
import { EditComponent } from './edit/edit.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { SettingsComponent } from './drill/settings/settings.component';
import { FirestoreComponent } from './firestore/firestore.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { UserComponent } from './user/user.component';
import { FormsComponent } from './forms/forms.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

const appRoutes: Routes = [
  { path: '', redirectTo: '/drill', pathMatch: 'full' },
  { path: 'connect', component: SetupComponent },
  { path: 'drill', component: DrillComponent},
  { path: 'forms', component: FormsComponent},
  { path: 'edit', component: EditComponent},
  { path: 'user', component: UserComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    SetupComponent,
    NavComponent,
    ResultsComponent,
    CardResultsComponent,
    DrillComponent,
    EditComponent,
    SettingsComponent,
    FirestoreComponent,
    RealtimeComponent,
    UserComponent,
    FormsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    RouterModule.forRoot(appRoutes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatSelectModule,
    MatExpansionModule,
    MatInputModule,
    FormsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTabsModule,
    DragDropModule
  ],
  entryComponents: [SettingsComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
