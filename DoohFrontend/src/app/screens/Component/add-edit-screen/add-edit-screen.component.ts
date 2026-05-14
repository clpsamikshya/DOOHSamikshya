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
import { ScreenStatus, ScreenOrientation, DayOfWeek } from '../../model/ScreenEnum';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
    selector: 'add-edit-screen',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './add-edit-screen.component.html',
    styleUrl: './add-edit-screen.component.scss',
})
export class AddEditScreenComponent extends AppComponent implements OnInit, OnDestroy {

    @Output() onSave = new EventEmitter<Screens>();

    private destroy$ = new Subject<void>();

    isShow = false;
    existingData: Screens | null = null;
    screen: Screens = new Screens();

    // Operating hour slots shown in the table
    slotList: OperatingHourSlot[] = [];
    private slotCounter = 0;

    // Draft form for adding a new slot
    draftSlot: OperatingHourSlot = this.createEmptySlot();

    // Existing DB records — needed to delete from API when editing
    existingOperatingHours: ScreenOperatingHour[] = [];

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

    // Called from parent to open the dialog
    show(screen?: Screens): void {
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

        this.existingOperatingHours = screen?.operatingHour || [];
        this.slotList = this.convertOperatingHoursToSlots(screen?.operatingHour || []);
        this.slotCounter = this.slotList.length;
        this.draftSlot = this.createEmptySlot();
        this.isShow = true;
    }

    // ─── Draft slot form ──────────────────────────────────────────

    createEmptySlot(): OperatingHourSlot {
        return { id: '', selectedDays: [], startTime: '', endTime: '', avgAudienceCount: 0 };
    }

    toggleDay(dayValue: number): void {
        const index = this.draftSlot.selectedDays.indexOf(dayValue);
        if (index === -1) {
            this.draftSlot.selectedDays.push(dayValue);
        } else {
            this.draftSlot.selectedDays.splice(index, 1);
        }
    }

    toggleEveryday(): void {
        this.draftSlot.selectedDays = this.isEverydaySelected()
            ? []
            : this.dayOptions.map(d => d.value);
    }

    isEverydaySelected(): boolean {
        return this.draftSlot.selectedDays.length === this.dayOptions.length;
    }

    // Adds the draft slot to the slot list after validation
    confirmSlot(): void {
        if (!this.validateDraftSlot()) return;

        this.slotList.push({
            ...this.draftSlot,
            id: `slot_${this.slotCounter++}`,
        });

        this.draftSlot = this.createEmptySlot();
    }

    // ─── Slot removal ─────────────────────────────────────────────

    // Removes a specific day or the whole slot
    // If editing an existing screen, deletes from API first
    removeSlot(slot: OperatingHourSlot, dayValue?: number): void {
        if (this.existingData === null) {
            this.removeSlotLocally(slot, dayValue);
            return;
        }

        const recordsToDelete = this.findMatchingOperatingHours(slot, dayValue);

        if (recordsToDelete.length === 0) {
            this.removeSlotLocally(slot, dayValue);
            return;
        }

        this.confirmAction({
            message: `Remove operating hours for ${this.buildDayLabel(slot, dayValue)}?`,
            header: 'Remove Operating Hours',
            accept: () => {
                const deletes = recordsToDelete.map(r =>
                    this.screenService.deleteOperatingHour(r.id, this.existingData!.id)
                );

                forkJoin(deletes)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.showMessage('Success', 'Operating hours removed', 'success');
                            this.removeSlotLocally(slot, dayValue);
                            const deletedIds = new Set(recordsToDelete.map(r => r.id));
                            this.existingOperatingHours = this.existingOperatingHours
                                .filter(h => !deletedIds.has(h.id));
                        },
                        error: (err) => {
                            this.showMessage('Error', err?.message || 'Failed to delete', 'error');
                        }
                    });
            }
        });
    }

    private removeSlotLocally(slot: OperatingHourSlot, dayValue?: number): void {
        if (dayValue !== undefined) {
            slot.selectedDays = slot.selectedDays.filter(d => d !== dayValue);
            if (slot.selectedDays.length === 0) {
                this.slotList = this.slotList.filter(s => s.id !== slot.id);
            }
        } else {
            this.slotList = this.slotList.filter(s => s.id !== slot.id);
        }
    }

    private findMatchingOperatingHours(slot: OperatingHourSlot, dayValue?: number): ScreenOperatingHour[] {
        const daysToMatch = dayValue !== undefined ? [dayValue] : slot.selectedDays;
        return this.existingOperatingHours.filter(h =>
            daysToMatch.includes(h.dayOfWeek) &&
            h.startTime.startsWith(slot.startTime) &&
            h.endTime.startsWith(slot.endTime)
        );
    }

    // ─── Display helpers ──────────────────────────────────────────

    getSlotDayRows(slot: OperatingHourSlot): { label: string; value: number }[] {
        return this.dayOptions.filter(d => slot.selectedDays.includes(d.value));
    }

    getDayLabel(dayValue: number): string {
        return this.dayOptions.find(d => d.value === dayValue)?.label || '';
    }

    private buildDayLabel(slot: OperatingHourSlot, dayValue?: number): string {
        if (dayValue !== undefined) return this.getDayLabel(dayValue);
        return this.dayOptions
            .filter(d => slot.selectedDays.includes(d.value))
            .map(d => d.label)
            .join(', ');
    }

    trackBySlotId(index: number, slot: OperatingHourSlot): string {
        return slot.id;
    }

    // ─── Validation ───────────────────────────────────────────────

    private validateDraftSlot(): boolean {
        if (this.draftSlot.selectedDays.length === 0) {
            alert('Select at least one day');
            return false;
        }
        if (!this.draftSlot.startTime || !this.draftSlot.endTime) {
            alert('Start and end time are required');
            return false;
        }
        if (this.draftSlot.startTime >= this.draftSlot.endTime) {
            alert('End time must be after start time');
            return false;
        }
        if (!this.isSlotTimeValid(this.draftSlot)) {
            alert('Time slot overlaps with an existing schedule');
            return false;
        }
        return true;
    }

    private isSlotTimeValid(proposed: OperatingHourSlot): boolean {
        for (const day of proposed.selectedDays) {
            const existingForDay = this.slotList.filter(s => s.selectedDays.includes(day));
            for (const existing of existingForDay) {
                if (proposed.startTime < existing.endTime && proposed.endTime > existing.startTime) {
                    return false;
                }
            }
        }
        return true;
    }

    // ─── Submit ───────────────────────────────────────────────────

    onSubmit(): void {
        if (!this.screen.name?.trim()) { alert('Screen name is required'); return; }
        if (!this.screen.location?.trim()) { alert('Location is required'); return; }
        if (!this.screen.resolution?.trim()) { alert('Resolution is required'); return; }
        if (this.slotList.length === 0) { alert('Add at least one operating hour slot'); return; }

        this.screen.operatingHour = this.slotList.flatMap(slot =>
            slot.selectedDays.map(dayOfWeek => {
                const hour = new ScreenOperatingHour();
                hour.dayOfWeek = dayOfWeek;
                hour.startTime = `${slot.startTime}:00`;
                hour.endTime = `${slot.endTime}:00`;
                hour.avgAudienceCount = slot.avgAudienceCount;
                hour.createdBy = 1;
                hour.updatedBy = 1;
                return hour;
            })
        );

        if (this.existingData) {
            this.screenService.update(this.screen as ScreenUpdate)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        this.showMessage('Success', 'Screen updated successfully', 'success');
                        this.isShow = false;
                        this.onSave.emit(res?.data);
                    },
                    error: (err: any) => {
                        this.showMessage('Error', err?.message || 'Failed to update screen', 'error');
                    }
                });
        } else {
            this.screenService.add(this.screen as ScreenInsert)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res: any) => {
                        this.showMessage('Success', 'Screen created successfully', 'success');
                        this.isShow = false;
                        this.onSave.emit(res?.data);
                    },
                    error: (err: any) => {
                        this.showMessage('Error', err?.message || 'Failed to create screen', 'error');
                    }
                });
        }
    }

    cancel(): void {
        this.isShow = false;
        this.existingData = null;
        this.screen = new Screens();
        this.slotList = [];
        this.draftSlot = this.createEmptySlot();
        this.existingOperatingHours = [];
    }

    // ─── Conversion helpers ───────────────────────────────────────

    private convertOperatingHoursToSlots(hours: ScreenOperatingHour[]): OperatingHourSlot[] {
        const grouped = new Map<string, OperatingHourSlot>();
        let counter = 0;

        for (const hour of hours) {
            const key = `${hour.startTime}|${hour.endTime}|${hour.avgAudienceCount}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    id: `slot_${counter++}`,
                    selectedDays: [],
                    startTime: hour.startTime.substring(0, 5),
                    endTime: hour.endTime.substring(0, 5),
                    avgAudienceCount: hour.avgAudienceCount,
                });
            }
            grouped.get(key)!.selectedDays.push(hour.dayOfWeek);
        }

        return Array.from(grouped.values());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}