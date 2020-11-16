import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SetupComponent } from './setup/setup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule} from '@angular/material/button';
import { MatSidenavModule} from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule} from '@angular/material/list';
import { MatTableModule} from '@angular/material/table';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule} from '@angular/material/sort';
import { MatCardModule} from '@angular/material/card';
import { MatSelectModule} from '@angular/material/select';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatInputModule} from '@angular/material/input';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatDialogModule} from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
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
import { UpdateComponent } from './edit/update/update.component';

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
    FormsComponent,
    UpdateComponent
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
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
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
  entryComponents: [SettingsComponent, UpdateComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
