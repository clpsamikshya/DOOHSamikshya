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

    // 🔹 Dropdown options
    // statusOptions = this.createDropdownOptions(ScreenStatus);
    // orientationOptions = this.createDropdownOptions(ScreenOrientation);
    // dayOptions = this.createDropdownOptions(DayOfWeek);

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

    // 🔹 Convert enum to dropdown
    // createDropdownOptions(enumObject: any) {
    //     const result: any[] = [];

    //     for (const key in enumObject) {
    //         if (typeof enumObject[key] === 'number') {
    //             result.push({
    //                 label: key,
    //                 value: enumObject[key],
    //             });
    //         }
    //     }

    //     return result;
    // }

    // 🔹 Open form
    // onShow(screen?: Screens): void {
    //     this.isShow = true;
    //     this.existingData = screen || null;

    //     // Fill form data
    //     this.screen = {
    //         id: screen?.id || 0,
    //         tenantId: 1,
    //         name: screen?.name || '',
    //         location: screen?.location || '',
    //         resolution: screen?.resolution || '',
    //         tag: screen?.tag || null,
    //         orientation: screen?.orientation || ScreenOrientation.Landscape,
    //         status: screen?.status || ScreenStatus.Active,
    //         isDeleted: screen?.isDeleted || false,
    //         createdBy: 1,
    //         updatedBy: 1,
    //         operatingHour: screen?.operatingHour || [],
    //     };

    //     // Load slots
    //     this.slotList = [];
    //     this.loadSlotsFromExistingData();

    //     if (this.slotList.length === 0) {
    //         this.addNewSlot();
    //     }
    // }

    // 🔹 Convert existing operating hours into slots
    onShow(screen?: Screens): void {
    this.existingData = screen ?? null;
    this.screen = {
        id:            screen?.id          ?? 0,   // ?? not ||
        tenantId:      1,
        name:          screen?.name        || '',
        location:      screen?.location    || '',
        resolution:    screen?.resolution  || '',
        tag:           screen?.tag         ?? null,
        orientation:   screen?.orientation ?? ScreenOrientation.Landscape,
        status:        screen?.status      ?? ScreenStatus.Active,
        isDeleted:     false,
        createdBy:     1,
        updatedBy:     1,
        operatingHour: screen?.operatingHour || [],
    };
    this.slotList = [];
    this.loadSlotsFromExistingData();
    if (!this.slotList.length) this.addNewSlot();
    this.isShow = true; // ← move to end so form is ready before showing
}
    
    loadSlotsFromExistingData(): void {
        const existingHours = this.existingData?.operatingHour || [];

        const groupedData = new Map<string, OperatingHourSlot>();

        for (const hour of existingHours) {
            const key =
                hour.startTime +
                '|' +
                hour.endTime +
                '|' +
                hour.avgAudienceCount;

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

    // 🔹 Add new empty slot
    addNewSlot(): void {
        this.slotList.push({
            id: 'slot_' + this.slotCounter++,
            selectedDays: [],
            startTime: '',
            endTime: '',
            avgAudienceCount: 0,
        });
    }

    // 🔹 Remove slot
    removeSlot(slotId: string): void {
        this.slotList = this.slotList.filter((s) => s.id !== slotId);

        if (this.slotList.length === 0) {
            this.addNewSlot();
        }
    }

    // 🔹 Display selected days
    //getSelectedDayLabels(slot: OperatingHourSlot): string {
    //     if (!slot.selectedDays || slot.selectedDays.length === 0) {
    //         return 'No days selected';
    //     }

    //     const labels: string[] = [];

    //     for (const day of this.dayOptions) {
    //         if (slot.selectedDays.includes(day.value)) {
    //             labels.push(day.label);
    //         }
    //     }

    //     return labels.join(', ');
    // }

    getSelectedDayLabels(slot: OperatingHourSlot): string {
    if (!slot.selectedDays?.length) return 'No days selected';
    return this.dayOptions
        .filter(d => slot.selectedDays.includes(d.value))
        .map(d => d.label)
        .join(', ');
}

    trackBySlotId(index: number, slot: OperatingHourSlot): string {
        return slot.id;
    }

    // 🔹 Validate slots
    isSlotValid(): boolean {
        const dayMap = new Map<number, { start: string; end: string }[]>();

        for (const slot of this.slotList) {
            if (!slot.selectedDays || slot.selectedDays.length === 0) {
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
                if (!dayMap.has(day)) {
                    dayMap.set(day, []);
                }

                const existingTimes = dayMap.get(day)!;

                for (const time of existingTimes) {
                    const overlap =
                        slot.startTime < time.end && slot.endTime > time.start;

                    if (overlap) {
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

    // 🔹 Convert slots to API format
    //buildOperatingHours(): ScreenOperatingHour[] {
    //     const result: ScreenOperatingHour[] = [];

    //     for (const slot of this.slotList) {
    //         for (const day of slot.selectedDays) {
    //             const item = new ScreenOperatingHour();

    //             item.dayOfWeek = day;
    //             item.startTime = slot.startTime + ':00';
    //             item.endTime = slot.endTime + ':00';
    //             item.avgAudienceCount = slot.avgAudienceCount;
    //             item.createdBy = 1;
    //             item.updatedBy = 1;

    //             result.push(item);
    //         }
    //     }

    //     return result;
    // }

    buildOperatingHours(): ScreenOperatingHour[] {
    return this.slotList.flatMap(slot =>
        slot.selectedDays.map(day => {
            const item = new ScreenOperatingHour();
            item.dayOfWeek        = day;
            item.startTime        = `${slot.startTime}:00`;
            item.endTime          = `${slot.endTime}:00`;
            item.avgAudienceCount = slot.avgAudienceCount;
            item.createdBy        = 1;
            item.updatedBy        = 1;
            return item;
        })
    );
}

    // 🔹 Save
    // onSubmit(): void {
    //     if (
    //         !this.screen.name ||
    //         !this.screen.location ||
    //         !this.screen.resolution
    //     ) {
    //         this.showMessage(
    //             'Warning',
    //             'Please fill all required fields',
    //             'warn',
    //         );
    //         return;
    //     }

    //     if (!this.isSlotValid()) {
    //         return;
    //     }

    //     this.screen.operatingHour = this.buildOperatingHours();

    //     if (this.existingData) {
    //         this.updateScreen();
    //     } else {
    //         this.createScreen();
    //     }
    // }

 onSubmit(): void {
    const { name, location, resolution } = this.screen;
    if (!name || !location || !resolution) {
        this.showMessage('Warning', 'Please fill all required fields', 'warn');
        return;
    }
    if (!this.isSlotValid()) return;

    this.screen.operatingHour = this.buildOperatingHours();
    this.existingData ? this.updateScreen() : this.createScreen();
}
 
    // 🔹 Separate methods (clearer than inline logic)
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
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
