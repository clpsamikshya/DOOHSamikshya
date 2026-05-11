import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, TitleCasePipe, RouterModule]
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
  }

  // screens: Screen[] = [];
  // activeScreensList: Screen[] = [];
  // isLoading = true;
  // error = '';
  // totalScreens = 0;
  // activeScreens = 0;
  // inactiveScreens = 0;
  // greeting = 'Good morning';
  // today = '';
  // currentUser: any = null;
  // currentTenant: any = null;

  // constructor(private screenService: ScreenService) {}

  // ngOnInit(): void {
  //   this.today = new Date().toLocaleDateString('en-US', {
  //     weekday: 'long',
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });

  //   // this.currentUser = { name: 'Samikshya', initials: 'S', role: 'Administrator' };
  //   // this.currentTenant = { name: 'Kathmandu Media Co.' };

  //   this.screenService.getAll().subscribe({
  //     next: (res: any) => {
  //       const data = Array.isArray(res) ? res : res.data;
  //       this.screens = data || [];
  //       this.totalScreens = this.screens.length;
  //       // this.activeScreens = this.screens.filter(s => s.isActive).length;
  //       // this.inactiveScreens = this.screens.filter(s => !s.isActive).length;
  //       // this.activeScreensList = this.screens.filter(s => s.isActive);
  //       this.isLoading = false;
  //     },
  //     error: () => {
  //       this.error = 'Could not load screens. Is the API running?';
  //       this.isLoading = false;
  //     }
  //   });
  // }
}