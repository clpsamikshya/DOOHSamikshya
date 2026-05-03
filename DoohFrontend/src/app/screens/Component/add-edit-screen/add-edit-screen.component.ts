import {
    Component,
    EventEmitter,
    Injector,
    OnInit,
    OnDestroy,
    Output,
} from '@angular/core';
import { sharedImports } from '../../../shared/sharedImports';
import { AppComponent } from '../../../app.component';
import {
    ScreenInsert,
    ScreenOperatingHour,
    OperatingHourSlot,
    Screens,
    ScreenUpdate,
} from '../../model/Screen';
import {
    ScreenStatus,
    ScreenOrientation,
    DayOfWeek,
} from '../../model/ScreenEnum';
import { Subject, takeUntil } from 'rxjs';
import { AddEditOperatingHourComponent } from '../add-edit-operating-hour/add-edit-operating-hour.component';

@Component({
    selector: 'add-edit-screen',
    standalone: true,

    imports: [sharedImports, AddEditOperatingHourComponent],
    templateUrl: './add-edit-screen.component.html',
    styleUrl: './add-edit-screen.component.scss',
})
export class AddEditScreenComponent
    extends AppComponent
    implements OnInit, OnDestroy
{
    private readonly destroy$ = new Subject<void>();

    @Output() onSave = new EventEmitter<Screens>();

    isShow = false;
    existingData: Screens | null = null;
    screen: Screens = new Screens();

    slotList: OperatingHourSlot[] = [];

    readonly statusOptions = [
        { label: 'Active', value: ScreenStatus.Active },
        { label: 'Inactive', value: ScreenStatus.InActive },
        { label: 'Under Maintenance', value: ScreenStatus.UnderMaintenance },
    ];

    readonly orientationOptions = [
        { label: 'Portrait', value: ScreenOrientation.Portrait },
        { label: 'Square', value: ScreenOrientation.Square },
        { label: 'Landscape', value: ScreenOrientation.Landscape },
    ];

    readonly dayOptions = [
        { label: 'Sunday', value: DayOfWeek.Sunday },
        { label: 'Monday', value: DayOfWeek.Monday },
        { label: 'Tuesday', value: DayOfWeek.Tuesday },
        { label: 'Wednesday', value: DayOfWeek.Wednesday },
        { label: 'Thursday', value: DayOfWeek.Thursday },
        { label: 'Friday', value: DayOfWeek.Friday },
        { label: 'Saturday', value: DayOfWeek.Saturday },
    ];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    onShow(screen?: Screens): void {
        this.existingData = screen ?? null;
        
        this.screen = {
            id: screen?.id ?? 0,
            tenantId: 1,
            name: screen?.name || '',
            location: screen?.location || '',
            resolution: screen?.resolution || '',
            tag: screen?.tag ?? null,
            orientation: screen?.orientation ?? ScreenOrientation.Landscape,
            status: screen?.status ?? ScreenStatus.Active,
            isDeleted: false,
            createdBy: 1,
            updatedBy: 1,
            operatingHour: screen?.operatingHour || [],
        };

        this.slotList = this.convertOperatingHoursToSlots(
            screen?.operatingHour || []
        );

        this.isShow = true;
    }

    private convertOperatingHoursToSlots(
        hours: ScreenOperatingHour[]
    ): OperatingHourSlot[] {
        const groupedSlots = new Map<string, OperatingHourSlot>();
        let slotCounter = 0;

        for (const hour of hours) {
            const slotKey = this.generateSlotKey(
                hour.startTime,
                hour.endTime,
                hour.avgAudienceCount
            );

            if (!groupedSlots.has(slotKey)) {
                groupedSlots.set(slotKey, {
                    id: `slot_${slotCounter++}`,
                    selectedDays: [],
                    startTime: this.formatTimeForInput(hour.startTime),
                    endTime: this.formatTimeForInput(hour.endTime),
                    avgAudienceCount: hour.avgAudienceCount,
                });
            }

            groupedSlots.get(slotKey)!.selectedDays.push(hour.dayOfWeek);
        }

        return Array.from(groupedSlots.values());
    }

    private generateSlotKey(
        startTime: string,
        endTime: string,
        audienceCount: number
    ): string {
        return `${startTime}|${endTime}|${audienceCount}`;
    }

    private formatTimeForInput(timeString: string): string {
        return timeString.substring(0, 5);
    }

    /**
     * CRITICAL FIX: Explicit type annotation for event handler.
     * This prevents the "Event vs OperatingHourSlot[]" error.
     * 
     * WHY: TypeScript infers $event as DOM Event by default.
     * We tell it explicitly: this is OperatingHourSlot[].
     */
    onSlotsUpdated(updatedSlots: OperatingHourSlot[]): void {
        this.slotList = updatedSlots;
    }

    private convertSlotsToOperatingHours(): ScreenOperatingHour[] {
        return this.slotList.flatMap((slot) =>
            slot.selectedDays.map((dayOfWeek) => {
                const hour = new ScreenOperatingHour();
                hour.dayOfWeek = dayOfWeek;
                hour.startTime = this.formatTimeForDatabase(slot.startTime);
                hour.endTime = this.formatTimeForDatabase(slot.endTime);
                hour.avgAudienceCount = slot.avgAudienceCount;
                hour.createdBy = 1;
                hour.updatedBy = 1;
                return hour;
            })
        );
    }

    private formatTimeForDatabase(timeString: string): string {
        return `${timeString}:00`;
    }

    private validateScreenBasicDetails(): boolean {
        const { name, location, resolution } = this.screen;

        if (!name?.trim()) {
            this.showMessage('Validation', 'Screen name is required', 'warn');
            return false;
        }

        if (!location?.trim()) {
            this.showMessage('Validation', 'Location is required', 'warn');
            return false;
        }

        if (!resolution?.trim()) {
            this.showMessage('Validation', 'Resolution is required', 'warn');
            return false;
        }

        return true;
    }

    private validateOperatingHours(): boolean {
        if (this.slotList.length === 0) {
            this.showMessage(
                'Validation',
                'Add at least one operating hour slot',
                'warn'
            );
            return false;
        }

        return true;
    }

    onSubmit(): void {
        if (!this.validateScreenBasicDetails()) return;
        if (!this.validateOperatingHours()) return;

        this.screen.operatingHour = this.convertSlotsToOperatingHours();

        this.existingData ? this.updateScreen() : this.createScreen();
    }

    private createScreen(): void {
        this.screenService
            .add(this.screen as ScreenInsert)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    this.showMessage(
                        'Success',
                        'Screen created successfully',
                        'success'
                    );
                    this.closeDialog();
                    this.onSave.emit(response?.data);
                },
                error: (error: any) => {
                    this.showMessage(
                        'Error',
                        error?.message || 'Failed to create screen',
                        'error'
                    );
                },
            });
    }

    private updateScreen(): void {
        this.screenService
            .update(this.screen as ScreenUpdate)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    this.showMessage(
                        'Success',
                        'Screen updated successfully',
                        'success'
                    );
                    this.closeDialog();
                    this.onSave.emit(response?.data);
                },
                error: (error: any) => {
                    this.showMessage(
                        'Error',
                        error?.message || 'Failed to update screen',
                        'error'
                    );
                },
            });
    }

    onCancel(): void {
        this.closeDialog();
    }

    private closeDialog(): void {
        this.isShow = false;
        this.existingData = null;
        this.screen = new Screens();
        this.slotList = [];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}