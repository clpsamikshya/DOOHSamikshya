import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { sharedImports } from '../../../shared/sharedImports';
import { AppComponent } from '../../../app.component';
import { Subject, takeUntil } from 'rxjs';
import { ScreenInsert, ScreenOperatingHour, Screens, ScreenUpdate } from '../../model/Screen';
import { ScreenStatus, ScreenOrientation, DayOfWeek } from '../../model/ScreenEnum';

interface OperatingHourSlot {
    id: string; // Client-side ID for tracking UI deletions
    selectedDays: number[];
    startTime: string;
    endTime: string;
    avgAudienceCount: number;
}

const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '17:00';
const DEFAULT_AUDIENCE_COUNT = 0;

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
    private slotIdCounter = 0;

    @Output() onSave = new EventEmitter<Screens>();

    isShow = false;
    existingData: Screens | null = null;
    screen: Screens = new Screens();

    statusOptions = Object.entries(ScreenStatus)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => ({
            label: key,
            value: value as number,
        }));

    orientationOptions = Object.entries(ScreenOrientation)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => ({
            label: key,
            value: value as number,
        }));

    days = Object.entries(DayOfWeek)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => ({
            label: key,
            value: value as number,
        }));

    operatingHourSlots: OperatingHourSlot[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    onShow(screen?: Screens): void {
        this.isShow = true;
        this.existingData = screen || null;
        this.initializeForm();
    }

    initializeForm(): void {
        this.screen = {
            id: this.existingData?.id || 0,
            tenantId: 1,
            name: this.existingData?.name || '',
            location: this.existingData?.location || '',
            resolution: this.existingData?.resolution || '',
            tag: this.existingData?.tag || null,
            orientation: this.existingData?.orientation || ScreenOrientation.Landscape,
            status: this.existingData?.status || ScreenStatus.Active,
            isDeleted: this.existingData?.isDeleted || false,
            createdBy: 1,
            updatedBy: 1,
            operatingHour: this.existingData?.operatingHour || [],
        };

        this.operatingHourSlots = this.parseExistingOperatingHours(
            this.existingData?.operatingHour || []
        );

        if (this.operatingHourSlots.length === 0) {
            this.addNewSlot();
        }
    }

//       onEverydayChange(slot: OperatingHourSlot): void {
//            slot.selectedDays = slot.isEveryday
//         ? this.days.map(d => d.value)
//         : [];
// }

    private parseExistingOperatingHours(hours: ScreenOperatingHour[]): OperatingHourSlot[] {
        if (!hours || hours.length === 0) {
            return [];
        }

        // Group hours by time signature
        const grouped = new Map<string, number[]>();

        for (const hour of hours) {
            const key = `${hour.startTime}|${hour.endTime}|${hour.avgAudienceCount}`;
            
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            
            grouped.get(key)!.push(hour.dayOfWeek);
        }

        // Convert groups to slots
        return Array.from(grouped.entries()).map(([key, dayValues]) => {
            const [startTime, endTime, avgAudienceCount] = key.split('|');
            
            return {
                id: this.generateSlotId(),
                selectedDays: dayValues,
                startTime: startTime.slice(0, 5), // HH:mm:ss -> HH:mm
                endTime: endTime.slice(0, 5),
                avgAudienceCount: Number(avgAudienceCount),
            };
        });
    }

    private generateSlotId(): string {
        return `slot_${this.slotIdCounter++}_${Date.now()}`;
    }

    addNewSlot(): void {
        const newSlot: OperatingHourSlot = {
            id: this.generateSlotId(),
            selectedDays: [],
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
            avgAudienceCount: DEFAULT_AUDIENCE_COUNT,
        };

        this.operatingHourSlots.push(newSlot);
    }

    removeSlot(slotId: string): void {
        const index = this.operatingHourSlots.findIndex(s => s.id === slotId);
        
        if (index === -1) {
            console.error(`Slot with id ${slotId} not found`);
            return;
        }

        this.operatingHourSlots.splice(index, 1);

        // Ensure at least one slot always exists
        if (this.operatingHourSlots.length === 0) {
            this.addNewSlot();
        }
    }

    getSelectedDayLabels(slot: OperatingHourSlot): string {
        if (!slot.selectedDays || slot.selectedDays.length === 0) {
            return 'No days selected';
        }

        return this.days
            .filter(d => slot.selectedDays.includes(d.value))
            .map(d => d.label)
            .join(', ');
    }

    trackBySlotId(index: number, slot: OperatingHourSlot): string {
    return slot.id;
}

    private validateOperatingHourSlots(): string | null {
        const dayTimeMap = new Map<number, Array<{ start: string; end: string; slotId: string }>>();

        for (const slot of this.operatingHourSlots) {
            if (!slot.selectedDays || slot.selectedDays.length === 0) {
                return 'Each operating hour slot must have at least one day selected';
            }

            if (!slot.startTime || !slot.endTime) {
                return 'Start time and end time are required for all slots';
            }

            if (slot.startTime >= slot.endTime) {
                return 'End time must be after start time';
            }

            // Check for day overlaps
            for (const day of slot.selectedDays) {
                if (!dayTimeMap.has(day)) {
                    dayTimeMap.set(day, []);
                }

                const existing = dayTimeMap.get(day)!;
                
                // Check if this time range overlaps with existing ranges for this day
                for (const { start, end, slotId } of existing) {
                    if (slotId !== slot.id) {
                        const overlaps = 
                            (slot.startTime < end && slot.endTime > start);
                        
                        if (overlaps) {
                            const dayLabel = this.days.find(d => d.value === day)?.label || `Day ${day}`;
                            return `Time overlap detected on ${dayLabel}: ${start}-${end} conflicts with ${slot.startTime}-${slot.endTime}`;
                        }
                    }
                }

                dayTimeMap.get(day)!.push({
                    start: slot.startTime,
                    end: slot.endTime,
                    slotId: slot.id,
                });
            }
        }

        return null;
    }

    /**
     * Convert UI slots into DB format (one record per day).
     */
    private buildOperatingHours(): ScreenOperatingHour[] {
        const hours: ScreenOperatingHour[] = [];

        for (const slot of this.operatingHourSlots) {
            for (const day of slot.selectedDays) {
                const oh = new ScreenOperatingHour();
                oh.dayOfWeek = day;
                oh.startTime = `${slot.startTime}:00`; // HH:mm -> HH:mm:ss
                oh.endTime = `${slot.endTime}:00`;
                oh.avgAudienceCount = slot.avgAudienceCount;
                oh.createdBy = 1;
                oh.updatedBy = 1;
                hours.push(oh);
            }
        }

        return hours;
    }

    onSubmit(): void {
        // Basic field validation
        if (!this.screen.name || !this.screen.location || !this.screen.resolution) {
            this.showMessage('Warning', 'Please fill in all required fields', 'warn');
            return;
        }

        // Operating hours validation
        const validationError = this.validateOperatingHourSlots();
        if (validationError) {
            this.showMessage('Validation Error', validationError, 'warn');
            return;
        }

        this.screen.operatingHour = this.buildOperatingHours();

        const request$ = this.existingData
            ? this.screenService.update(this.screen as ScreenUpdate)
            : this.screenService.add(this.screen as ScreenInsert);

        const successMessage = this.existingData 
            ? 'Screen updated successfully' 
            : 'Screen created successfully';

        request$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.showMessage('Success', successMessage, 'success');
                    this.isShow = false;
                    this.onSave.emit(res?.data);
                },
                error: (err: any) => {
                    const errorMessage = err?.message || 'An unexpected error occurred';
                    this.showMessage('Error', errorMessage, 'error');
                },
            });
    }

    onCancel(): void {
        this.isShow = false;
        this.existingData = null;
        this.screen = new Screens();
        this.operatingHourSlots = [];
        this.slotIdCounter = 0;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}