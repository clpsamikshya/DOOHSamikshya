import { Component, Injector, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';

@Component({
    selector: 'screen-info',
    standalone: true,
    imports: [...sharedImports],
    templateUrl: './screen-info.component.html',
    styleUrl: './screen-info.component.scss',
})
export class ScreenInfoComponent extends AppComponent implements OnDestroy {

    private destroy$ = new Subject<void>();

    isShow = false;
    isLoading = false;
    screen: any = null;  

    constructor(injector: Injector) {
        super(injector);
    }

    show(id: number): void {
        if (!id) return;

        this.isShow = true;
        this.loadScreen(id);
    }

    loadScreen(id: number): void {
    this.isLoading = true;

    this.screenService
        .getAll({
            search: '',
            status: null,
            orientation: null,
            offset: 0,
            pageSize: 1000,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res: any) => {
                const screens = res.data?.data ?? [];

                const foundScreen = screens.find((x: any) => x.id === id);

                if (!foundScreen) {
                    this.isLoading = false;
                    this.showMessage('Error', 'Screen not found', 'error');
                    this.close();
                    return;
                }

                this.screen = {
                    ...foundScreen,

                    statusLabel:
                        foundScreen.status === 1
                            ? 'Active'
                            : foundScreen.status === 2
                            ? 'Inactive'
                            : 'Unknown',
                };

                this.isLoading = false;
            },
            error: (err: any) => {
                this.isLoading = false;
                this.showMessage('Error', err.message, 'error');
            }
        });
}
    getDayName(dayOfWeek: number): string {
        const days = ['','Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    }

    close(): void {
        this.isShow = false;
        this.screen = null;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}