import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';

import { Screens, ScreenFilter, ScreenResponse } from '../../model/Screen';
import { ScreenStatus, ScreenOrientation } from '../../model/ScreenEnum';

import { AddEditScreenComponent } from '../add-edit-screen/add-edit-screen.component';
import { ScreenInfoComponent } from '../screen-info/screen-info.component';
import { ApiResponse } from '../../../campaign/Model/CampaignMedia';

@Component({
    selector: 'screen-list',
    standalone: true,
    imports: [...sharedImports, AddEditScreenComponent, ScreenInfoComponent],
    templateUrl: './screen-list.component.html',
    styleUrl: './screen-list.component.scss',
})
export class ScreenListComponent extends AppComponent implements OnInit, OnDestroy {

    @ViewChild('addedit') addedit!: AddEditScreenComponent;

    private destroy$ = new Subject<void>();

    screens: Screens[] = [];
    isLoading = false;
    pageSize = 10;
    totalRecords = 0;

    ScreenStatus = ScreenStatus;

    statusOptions = [
        { label: 'Active', value: ScreenStatus.Active },
        { label: 'Inactive', value: ScreenStatus.InActive },
        { label: 'Under Maintenance', value: ScreenStatus.UnderMaintenance },
    ];

    orientationOptions = [
        { label: 'Portrait', value: ScreenOrientation.Portrait },
        { label: 'Landscape', value: ScreenOrientation.Landscape },
        { label: 'Square', value: ScreenOrientation.Square },
    ];

    filter: ScreenFilter = {
        search: '',
        status: null,
        orientation: null,
        offset: 0,
        pageSize: 10,
    };

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.loadScreens();
    }

    loadScreens(showLoader = true): void {
        if (showLoader) this.isLoading = true;

        this.screenService.getAll(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res : ApiResponse<ScreenResponse>) => {
                    this.screens = res?.data?.data ?? [];
                    this.totalRecords = res?.data?.totalRows ?? 0;
                    this.isLoading = false;
                },
                error: (err) => {
                    this.isLoading = false;
                    this.showMessage('Error', err.message, 'error');
                },
            });
    }

    applyFilter(): void {
        this.filter.offset = 0;
        this.loadScreens(false);
    }

    clearFilter(): void {
        this.filter.search = '';
        this.filter.status = null;
        this.filter.orientation = null;
        this.filter.offset = 0;
        this.filter.pageSize = this.pageSize;
        this.loadScreens(false);
    }

    onPageChange(event: any): void {
        this.filter.offset = event.first;
        this.filter.pageSize = event.rows;
        this.loadScreens();
    }

    deleteScreen(screen: Screens): void {
        this.confirmAction({
            message: `Are you sure you want to delete ${screen.name}?`,
            header: 'Delete Confirmation',
            accept: () => {
                this.screenService.delete(screen.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.showMessage('Success', 'Screen deleted successfully', 'success');
                            this.loadScreens(false);
                        },
                        error: (err) => {
                            this.showMessage('Error', err.message, 'error');
                        },
                    });
            },
            reject: () => {
                this.showMessage('Info', 'Cancelled', 'info');
            },
        });
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}