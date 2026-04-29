import { Routes } from '@angular/router';
import { ScreenListComponent } from './screens/Component/screen-list/screen-list.component';

import { MediaLibraryComponent } from './media/component/media-library/media-library.component';
import { DashboardComponent } from './shared/component/dashboard/dashboard.component';
import { LayoutComponent } from './shared/component/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '',            redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',   component: DashboardComponent },
      { path: 'screen-name', component: ScreenListComponent },
      { path: 'media-library', component: MediaLibraryComponent },
    ]
  }
];