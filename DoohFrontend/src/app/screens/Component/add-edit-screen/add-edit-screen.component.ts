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
import { Subject, takeUntil, forkJoin } from 'rxjs';

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
    private destroy$ = new Subject<void>();

    @Output() onSave = new EventEmitter<Screens>();

    isShow = false;
    existingData: Screens | null = null;
    screen: Screens = new Screens();

    slotList: OperatingHourSlot[] = [];
    slotCounter = 0;
    draftSlot: OperatingHourSlot = this.emptyDraft();

    statusOptions = [
        { label: 'Active', value: ScreenStatus.Active },
        { label: 'Inactive', value: ScreenStatus.InActive },
        { label: 'Under Maintenance', value: ScreenStatus.UnderMaintenance },
    ];

    orientationOptions = [
        { label: 'Portrait', value: ScreenOrientation.Portrait },
        { label: 'Square', value: ScreenOrientation.Square },
        { label: 'Landscape', value: ScreenOrientation.Landscape },
    ];

    dayOptions = [
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
        this.slotList = [];
        this.slotCounter = 0;
        this.draftSlot = this.emptyDraft();
        this.loadSlotsFromExistingData();
        this.isShow = true;
    }

    loadSlotsFromExistingData(): void {
        const existingHours = this.existingData?.operatingHour || [];
        const groupedData = new Map<string, OperatingHourSlot>();

        for (const hour of existingHours) {
            const key = `${hour.startTime}|${hour.endTime}|${hour.avgAudienceCount}`;

            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    id: 'slot_' + this.slotCounter++,
                    selectedDays: [],
                    startTime: hour.startTime.substring(0, 5),
                    endTime: hour.endTime.substring(0, 5),
                    avgAudienceCount: hour.avgAudienceCount,
                });
            }

            groupedData.get(key)!.selectedDays.push(hour.dayOfWeek);
        }

        this.slotList = Array.from(groupedData.values());
    }

    private emptyDraft(): OperatingHourSlot {
        return {
            id: '',
            selectedDays: [],
            startTime: '',
            endTime: '',
            avgAudienceCount: 0,
        };
    }

    toggleDay(day: number): void {
        const idx = this.draftSlot.selectedDays.indexOf(day);
        idx === -1
            ? this.draftSlot.selectedDays.push(day)
            : this.draftSlot.selectedDays.splice(idx, 1);
    }

    confirmSlot(): void {
        if (!this.draftSlot.selectedDays.length) {
            this.showMessage('Validation', 'Select at least one day', 'warn');
            return;
        }
        if (!this.draftSlot.startTime || !this.draftSlot.endTime) {
            this.showMessage(
                'Validation',
                'Start and end time are required',
                'warn',
            );
            return;
        }
        if (this.draftSlot.startTime >= this.draftSlot.endTime) {
            this.showMessage(
                'Validation',
                'End time must be after start time',
                'warn',
            );
            return;
        }

        this.slotList.push({
            ...this.draftSlot,
            id: 'slot_' + this.slotCounter++,
        });

        this.draftSlot = this.emptyDraft();
    }

    removeSlot(slot: OperatingHourSlot, dayValue?: number): void {
        const removeLocally = () => {
            if (dayValue !== undefined) {
                // Remove only this day from the slot
                slot.selectedDays = slot.selectedDays.filter(
                    (d) => d !== dayValue,
                );
                // If no days left, remove the entire slot
                if (!slot.selectedDays.length) {
                    this.slotList = this.slotList.filter(
                        (s) => s.id !== slot.id,
                    );
                }
            } else {
                this.slotList = this.slotList.filter((s) => s.id !== slot.id);
            }
        };

        if (!this.existingData) {
            removeLocally();
            return;
        }

        const matchingHours = this.existingData.operatingHour.filter(
            (oh) =>
                (dayValue !== undefined
                    ? oh.dayOfWeek === dayValue
                    : slot.selectedDays.includes(oh.dayOfWeek)) &&
                oh.startTime.startsWith(slot.startTime) &&
                oh.endTime.startsWith(slot.endTime),
        );

        if (!matchingHours.length) {
            removeLocally();
            return;
        }

        const dayLabel =
            dayValue !== undefined
                ? this.dayOptions.find((d) => d.value === dayValue)?.label
                : this.getSelectedDayLabels(slot);

        this.confirmAction({
            message: `Remove hours for ${dayLabel}?`,
            header: 'Remove Operating Hours',
            accept: () => {
                forkJoin(
                    matchingHours.map((oh) =>
                        this.screenService.deleteOperatingHour(
                            oh.id,
                            this.existingData!.id,
                        ),
                    ),
                )
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.showMessage(
                                'Success',
                                'Operating hours removed',
                                'success',
                            );
                            removeLocally();
                            this.existingData!.operatingHour =
                                this.existingData!.operatingHour.filter(
                                    (oh) =>
                                        !matchingHours.some(
                                            (m) => m.id === oh.id,
                                        ),
                                );
                        },
                        error: (err: any) => {
                            this.showMessage(
                                'Error',
                                err?.message || 'Delete failed',
                                'error',
                            );
                        },
                    });
            },
        });
    }

    getSelectedDayLabels(slot: OperatingHourSlot): string {
        if (!slot.selectedDays?.length) return 'No days selected';
        return this.dayOptions
            .filter((d) => slot.selectedDays.includes(d.value))
            .map((d) => d.label)
            .join(', ');
    }

    getSlotDayRows(
        slot: OperatingHourSlot,
    ): { label: string; value: number }[] {
        return this.dayOptions.filter((d) =>
            slot.selectedDays.includes(d.value),
        );
    }

    isFirstDay(slot: OperatingHourSlot, day: string): boolean {
        return this.getSlotDayRows(slot)[0].label === day;
    }

    trackBySlotId(index: number, slot: OperatingHourSlot): string {
        return slot.id;
    }

    isSlotValid(): boolean {
        if (!this.slotList.length) {
            this.showMessage(
                'Validation Error',
                'Add at least one operating hour slot',
                'warn',
            );
            return false;
        }

        const dayMap = new Map<number, { start: string; end: string }[]>();

        for (const slot of this.slotList) {
            if (!slot.selectedDays?.length) {
                this.showMessage(
                    'Validation Error',
                    'Each slot must have at least one day',
                    'warn',
                );
                return false;
            }
            if (!slot.startTime || !slot.endTime) {
                this.showMessage(
                    'Validation Error',
                    'Start and End time required',
                    'warn',
                );
                return false;
            }
            if (slot.startTime >= slot.endTime) {
                this.showMessage(
                    'Validation Error',
                    'End time must be after start time',
                    'warn',
                );
                return false;
            }

            for (const day of slot.selectedDays) {
                if (!dayMap.has(day)) dayMap.set(day, []);

                const existingTimes = dayMap.get(day)!;

                for (const time of existingTimes) {
                    if (
                        slot.startTime < time.end &&
                        slot.endTime > time.start
                    ) {
                        this.showMessage(
                            'Validation Error',
                            'Time overlap detected',
                            'warn',
                        );
                        return false;
                    }
                }

                existingTimes.push({
                    start: slot.startTime,
                    end: slot.endTime,
                });
            }
        }

        return true;
    }

    buildOperatingHours(): ScreenOperatingHour[] {
        return this.slotList.flatMap((slot) =>
            slot.selectedDays.map((day) => {
                const item = new ScreenOperatingHour();
                item.dayOfWeek = day;
                item.startTime = `${slot.startTime}:00`;
                item.endTime = `${slot.endTime}:00`;
                item.avgAudienceCount = slot.avgAudienceCount;
                item.createdBy = 1;
                item.updatedBy = 1;
                return item;
            }),
        );
    }

    onSubmit(): void {
        const { name, location, resolution } = this.screen;
        if (!name || !location || !resolution) {
            this.showMessage(
                'Warning',
                'Please fill all required fields',
                'warn',
            );
            return;
        }
        if (!this.isSlotValid()) return;

        this.screen.operatingHour = this.buildOperatingHours();
        this.existingData ? this.updateScreen() : this.createScreen();
    }

    createScreen(): void {
        this.screenService
            .add(this.screen as ScreenInsert)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.showMessage(
                        'Success',
                        'Screen created successfully',
                        'success',
                    );
                    this.isShow = false;
                    this.onSave.emit(res?.data);
                },
                error: (err: any) => {
                    this.showMessage(
                        'Error',
                        err?.message || 'Error occurred',
                        'error',
                    );
                },
            });
    }

    updateScreen(): void {
        this.screenService
            .update(this.screen as ScreenUpdate)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.showMessage(
                        'Success',
                        'Screen updated successfully',
                        'success',
                    );
                    this.isShow = false;
                    this.onSave.emit(res?.data);
                },
                error: (err: any) => {
                    this.showMessage(
                        'Error',
                        err?.message || 'Error occurred',
                        'error',
                    );
                },
            });
    }

    onCancel(): void {
        this.isShow = false;
        this.existingData = null;
        this.screen = new Screens();
        this.slotList = [];
        this.slotCounter = 0;
        this.draftSlot = this.emptyDraft();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
