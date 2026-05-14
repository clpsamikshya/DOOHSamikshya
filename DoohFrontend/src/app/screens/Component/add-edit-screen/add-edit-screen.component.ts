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
    ScreenResolution,
} from '../../model/ScreenEnum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'add-edit-screen',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './add-edit-screen.component.html',
    styleUrl: './add-edit-screen.component.scss',
})
export class AddEditScreenComponent
    extends AppComponent
    implements OnInit, OnDestroy
{
    @Output() onSave = new EventEmitter<Screens>();

    private destroy$ = new Subject<void>();

    isShow = false;
    existingData: Screens | null = null;
    screen: Screens = new Screens();

    slotList: OperatingHourSlot[] = [];
    private slotCounter = 0;

    draftSlot: OperatingHourSlot = this.createEmptySlot();

    // TEMP UI ONLY (IMPORTANT)
    draftStartTime: Date | null = null;
    draftEndTime: Date | null = null;

    existingOperatingHours: ScreenOperatingHour[] = [];

    readonly statusOptions = Object.values(ScreenStatus)
        .filter(v => typeof v === 'number')
        .map(v => ({
            label: ScreenStatus[v as number],
            value: v as number,
        }));

    readonly orientationOptions = Object.values(ScreenOrientation)
        .filter(v => typeof v === 'number')
        .map(v => ({
            label: ScreenOrientation[v as number],
            value: v as number,
        }));

    resolutionOptions = Object.values(ScreenResolution).map(v => ({
        label: v,
        value: v,
    }));

    readonly dayOptions = Object.values(DayOfWeek)
        .filter(v => typeof v === 'number')
        .map(v => ({
            label: DayOfWeek[v as number],
            value: v as number,
        }));

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    // =========================
    // OPEN
    // =========================
    show(screen?: Screens): void {
        this.existingData = screen ?? null;

        this.screen = {
            id: screen?.id ?? 0,
            tenantId: 1,
            name: screen?.name || '',
            location: screen?.location || '',
            resolution: screen?.resolution ?? ScreenResolution.R1920x1080,
            tag: screen?.tag ?? null,
            orientation: screen?.orientation ?? ScreenOrientation.Landscape,
            status: screen?.status ?? ScreenStatus.Active,
            isDeleted: false,
            createdBy: 1,
            updatedBy: 1,
            operatingHour: screen?.operatingHour || [],
        };

        this.existingOperatingHours = screen?.operatingHour || [];
        this.slotList = this.convertOperatingHoursToSlots(
            screen?.operatingHour || [],
        );

        this.slotCounter = this.slotList.length;
        this.draftSlot = this.createEmptySlot();

        this.draftStartTime = null;
        this.draftEndTime = null;

        this.isShow = true;
    }

    // =========================
    // EMPTY SLOT
    // =========================
    createEmptySlot(): OperatingHourSlot {
        return {
            id: '',
            selectedDays: [],
            startTime: '',
            endTime: '',
            avgAudienceCount: 0,
        };
    }

    // =========================
    // TIME CONVERT
    // =========================
    private formatTime(date: Date | null): string {
        if (!date) return '';
        return date.toTimeString().split(' ')[0]; // HH:mm:ss
    }

    // =========================
    // ADD SLOT
    // =========================
    confirmSlot(): void {
        if (!this.validateDraftSlot()) return;

        this.slotList.push({
            id: `slot_${this.slotCounter++}`,
            selectedDays: this.draftSlot.selectedDays,
            startTime: this.formatTime(this.draftStartTime),
            endTime: this.formatTime(this.draftEndTime),
            avgAudienceCount: this.draftSlot.avgAudienceCount,
        });

        this.draftSlot = this.createEmptySlot();
        this.draftStartTime = null;
        this.draftEndTime = null;
    }

    // =========================
    // VALIDATION (STRING SAFE)
    // =========================
    private validateDraftSlot(): boolean {
        const slot = this.draftSlot;

        if (!slot.selectedDays.length) {
            this.showMessage('Validation Error', 'Select at least one day', 'warn');
            return false;
        }

        const start = this.formatTime(this.draftStartTime);
        const end = this.formatTime(this.draftEndTime);

        if (!start || !end) {
            this.showMessage('Validation Error', 'Start/end required', 'warn');
            return false;
        }

        if (start >= end) {
            this.showMessage('Validation Error', 'End must be after start', 'warn');
            return false;
        }

        for (const day of slot.selectedDays) {
            for (const existing of this.slotList) {
                if (!existing.selectedDays.includes(day)) continue;

                if (start < existing.endTime && end > existing.startTime) {
                    this.showMessage(
                        'Validation Error',
                        `${this.getDayLabel(day)} overlap detected`,
                        'error',
                    );
                    return false;
                }
            }
        }

        return true;
    }

    // =========================
    // REMOVE SLOT
    // =========================
    removeSlot(slot: OperatingHourSlot, dayValue?: number): void {
        if (dayValue !== undefined) {
            slot.selectedDays = slot.selectedDays.filter(d => d !== dayValue);
            if (slot.selectedDays.length === 0) {
                this.slotList = this.slotList.filter(s => s.id !== slot.id);
            }
        } else {
            this.slotList = this.slotList.filter(s => s.id !== slot.id);
        }
    }

    // =========================
    // HELPERS
    // =========================
    getSlotDayRows(slot: OperatingHourSlot) {
        return this.dayOptions.filter(d =>
            slot.selectedDays.includes(d.value),
        );
    }

    getDayLabel(dayValue: number): string {
        return this.dayOptions.find(d => d.value === dayValue)?.label || '';
    }

    trackBySlotId(index: number, slot: OperatingHourSlot): string {
        return slot.id;
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
    this.draftSlot.selectedDays =
        this.isEverydaySelected()
            ? []
            : this.dayOptions.map(d => d.value);
}

isEverydaySelected(): boolean {
    return (
        this.draftSlot.selectedDays.length === this.dayOptions.length &&
        this.dayOptions.length > 0
    );
}

    // =========================
    // CONVERT BACKEND → UI
    // =========================
    private convertOperatingHoursToSlots(
        hours: ScreenOperatingHour[],
    ): OperatingHourSlot[] {
        const grouped = new Map<string, OperatingHourSlot>();
        let counter = 0;

        for (const hour of hours) {
            const key = `${hour.startTime}|${hour.endTime}|${hour.avgAudienceCount}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    id: `slot_${counter++}`,
                    selectedDays: [],
                    startTime: hour.startTime?.substring(0, 8) ?? '',
                    endTime: hour.endTime?.substring(0, 8) ?? '',
                    avgAudienceCount: hour.avgAudienceCount,
                });
            }

            grouped.get(key)!.selectedDays.push(hour.dayOfWeek);
        }

        return Array.from(grouped.values());
    }

    // =========================
    // SUBMIT
    // =========================
    onSubmit(): void {
        if (!this.screen.name?.trim()) {
            alert('Screen name required');
            return;
        }

        if (!this.slotList.length) {
            alert('Add slots');
            return;
        }

        this.screen.operatingHour = this.slotList.flatMap(slot =>
            slot.selectedDays.map(day => {
                const h = new ScreenOperatingHour();
                h.dayOfWeek = day;
                h.startTime = slot.startTime;
                h.endTime = slot.endTime;
                h.avgAudienceCount = slot.avgAudienceCount;
                h.createdBy = 1;
                h.updatedBy = 1;
                return h;
            }),
        );

        const req$ = this.existingData
            ? this.screenService.update(this.screen as ScreenUpdate)
            : this.screenService.add(this.screen as ScreenInsert);

        req$.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.showMessage('Success', 'Saved', 'success');
                this.isShow = false;
                this.onSave.emit();
            },
            error: err => {
                this.showMessage('Error', err?.message, 'error');
            },
        });
    }

    cancel(): void {
        this.isShow = false;
        this.slotList = [];
        this.draftSlot = this.createEmptySlot();
        this.draftStartTime = null;
        this.draftEndTime = null;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}