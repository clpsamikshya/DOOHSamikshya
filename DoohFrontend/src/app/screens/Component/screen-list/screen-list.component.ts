import {
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { sharedImports } from '../../../shared/sharedImports';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from '../../../app.component';
import { ActivatedRoute } from '@angular/router';
import { ScreenFilter, ScreenOperatingHour, Screens } from '../../model/Screen';
import { AddEditScreenComponent } from '../add-edit-screen/add-edit-screen.component';
import { ScreenOperatingHourComponent } from '../screen-operating-hour/screen-operating-hour.component';
import { ScreenStatus, ScreenOrientation } from '../../model/ScreenEnum';

@Component({
    selector: 'screen-list',
    standalone: true,
    imports: [
        sharedImports,
        AddEditScreenComponent,
        ScreenOperatingHourComponent,
    ],

    templateUrl: './screen-list.component.html',
    styleUrl: './screen-list.component.scss',
})

export class ScreenListComponent extends AppComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  protected readonly ScreenStatus = ScreenStatus;
  protected readonly ScreenOrientation = ScreenOrientation;

  isLoading    = false;
  screens      : Screens[] = [];
  totalRecords = 0;
  pageSize     = 10;

  filter: ScreenFilter = {
    search      : '',
    status      : null,
    orientation : null,
    offset      : 0,
    pageSize    : 10
  };

  @ViewChild(AddEditScreenComponent) addEditScreenComponent!: AddEditScreenComponent;

  constructor(injector: Injector, private route: ActivatedRoute) {
    super(injector);
  }

  statusOptions = [
    { label: 'Active',            value: ScreenStatus.Active },
    { label: 'Inactive',          value: ScreenStatus.InActive },
    { label: 'Under Maintenance', value: ScreenStatus.UnderMaintenance },
  ];

  orientationOptions = [
    { label: 'Portrait',  value: ScreenOrientation.Portrait  },
    { label: 'Square',    value: ScreenOrientation.Square    },
    { label: 'Landscape', value: ScreenOrientation.Landscape },
  ];

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.filter = {
          ...this.filter,
          search  : params['search'] ?? '',
          offset  : 0,
          pageSize: this.pageSize
        };
        this.loadScreens();
      });
  }

  applyFilter(): void {
    this.filter = { ...this.filter, offset: 0 }; // ✅ reset to first page
    this.loadScreens();
  }

  clearFilter(): void {
    this.filter = {
      search      : '',
      status      : null,
      orientation : null,
      offset      : 0,
      pageSize    : this.pageSize
    };
    this.loadScreens();
  }

  // ✅ PrimeNG fires this with event.first = row index, event.rows = pageSize
  onPageChange(event: any): void {
    this.filter = {
      ...this.filter,
      offset  : event.first,       // ✅ event.first IS the offset directly
      pageSize: event.rows
    };
    this.loadScreens();
  }

  loadScreens(): void {
    this.isLoading = true;
    this.screenService
      .getAll(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {

             console.log('Full response:', res);           // ✅ add this
    console.log('res.data:', res.data);           // ✅ add this
    console.log('res.data.data:', res.data?.data);
          this.screens      = res.data?.data      ?? [];
          this.totalRecords = res.data?.totalRows ?? 0; // ✅ matches SP output
          this.isLoading    = false;
        },
        error: (err: any) => {
          this.isLoading = false;
          this.showMessage('Error', err.message, 'error');
        }
      });
  }

  deleteScreen(screen: Screens): void {
    this.confirmAction({
      message : `Are you sure you want to delete screen ${screen.name}?`,
      header  : 'Confirm Deletion',
      accept  : () => {
        this.screenService
          .delete(screen.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next  : () => {
              this.showMessage('Success', 'Screen deleted successfully', 'success');
              this.loadScreens();
            },
            error : (err: Error) => this.showMessage('Error', err.message, 'error'),
          });
      },
      reject: () => this.showMessage('Info', 'Screen deletion cancelled', 'info'),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}