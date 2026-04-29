import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  isCollapsed = false;
  pageTitle = 'Dashboard';

  mainNav = [
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard',   badge: null },
    { key: 'screens',   label: 'Screens',   route: '/screen-name', badge: null },
    { key: 'media',   label: 'Media',   route: '/media-library', badge: null }, 
    { key: 'campaigns', label: 'Campaigns', route: '/campaigns',   badge: null },
    // { key: 'Tenant', label: 'Tenant', route: '/tenant',   badge: null },
    // { key: 'reports',   label: 'Reports',   route: '/reports',     badge: null },
  ];

  manageNav = [
    { key: 'users',    label: 'Users',    route: '/users',    badge: null },
    { key: 'settings', label: 'Settings', route: '/settings', badge: null },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
   
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const all = [...this.mainNav, ...this.manageNav];
      const match = all.find(n => e.urlAfterRedirects.startsWith(n.route));
      if (match) this.pageTitle = match.label;
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}