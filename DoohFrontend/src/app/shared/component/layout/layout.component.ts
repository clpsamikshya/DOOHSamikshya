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
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home', badge: null },
  ];

  manageNav = [
    { key: 'screens',   label: 'Screens',   route: '/screen-name',    icon: 'pi pi-desktop' },
    { key: 'media',     label: 'Media',     route: '/media-library',  icon: 'pi pi-images' },
    { key: 'campaigns', label: 'Campaigns', route: '/campaigns-list', icon: 'pi pi-megaphone' },
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