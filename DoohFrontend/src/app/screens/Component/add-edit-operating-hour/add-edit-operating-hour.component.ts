import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    OnChanges,
    SimpleChanges,
    Output,
    Input,
} from '@angular/core';
import { sharedImports } from '../../../shared/sharedImports';
import { AppComponent } from '../../../app.component';
import {
    ScreenOperatingHour,
    OperatingHourSlot,
} from '../../model/Screen';
import { DayOfWeek } from '../../model/ScreenEnum';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
    selector: 'add-edit-operating-hour',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './add-edit-operating-hour.component.html',
    styleUrl: './add-edit-operating-hour.component.scss',
})
export class AddEditOperatingHourComponent
    extends AppComponent
    implements OnInit, OnDestroy, OnChanges
{
    private readonly destroy$ = new Subject<void>();

    @Output() slotsUpdated = new EventEmitter<OperatingHourSlot[]>();

    // Inputs for embedded mode (when used directly in parent tab)
    @Input() slotList: OperatingHourSlot[] = [];
    @Input() screenId: number | null = null;
    @Input() existingOperatingHours: ScreenOperatingHour[] = [];
    @Input() isEmbedded: boolean = false; // true = embedded in tab, false = standalone dialog

    isVisible = false;
    
    // Working copy - only used in dialog mode
    private workingSlotList: OperatingHourSlot[] = [];
    private slotCounter = 0;

    // Form for adding new slot
    draftSlot: OperatingHourSlot = this.createEmptySlot();

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

    ngOnInit(): void {
        // Initialize counter based on existing slots
        if (this.isEmbedded && this.slotList.length > 0) {
            this.slotCounter = this.findMaxSlotCounter(this.slotList);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // When parent updates slotList, sync our counter
        if (changes['slotList'] && this.isEmbedded) {
            this.slotCounter = this.findMaxSlotCounter(this.slotList);
        }
    }
    open(
        currentSlots: OperatingHourSlot[],
        screenId: number | null,
        existingHours: ScreenOperatingHour[]
    ): void {
        // Deep clone to avoid mutating parent's data until save
        this.workingSlotList = JSON.parse(JSON.stringify(currentSlots));
        this.screenId = screenId;
        this.existingOperatingHours = existingHours;
        
        this.slotCounter = this.findMaxSlotCounter(currentSlots);
        
        this.draftSlot = this.createEmptySlot();
        this.isVisible = true;
    }

    private findMaxSlotCounter(slots: OperatingHourSlot[]): number {
        if (slots.length === 0) return 0;

        const maxId = Math.max(
            ...slots.map((s) => {
                const match = s.id.match(/slot_(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            })
        );

        return maxId + 1;
    }
    
    createEmptySlot(): OperatingHourSlot {
        return {
            id: '',
            selectedDays: [],
            startTime: '',
            endTime: '',
            avgAudienceCount: 0,
        };
    }

    /**
     * Toggles day selection in the draft slot.
     * If day exists, removes it. If not, adds it.
     */
    toggleDay(dayValue: number): void {
        const dayIndex = this.draftSlot.selectedDays.indexOf(dayValue);

        if (dayIndex === -1) {
            this.draftSlot.selectedDays.push(dayValue);
        } else {
            this.draftSlot.selectedDays.splice(dayIndex, 1);
        }
    }

    toggleEveryday(): void {
    if (this.isEverydaySelected()) {
        this.draftSlot.selectedDays = [];
    } else {
        this.draftSlot.selectedDays = this.dayOptions.map(day => day.value);
    }
}

isEverydaySelected(): boolean {
    return this.draftSlot.selectedDays.length === this.dayOptions.length;
}


    private validateDraftSlot(): boolean {
        if (this.draftSlot.selectedDays.length === 0) {
            this.showMessage('Validation', 'Select at least one day', 'warn');
            return false;
        }

        if (!this.draftSlot.startTime || !this.draftSlot.endTime) {
            this.showMessage(
                'Validation',
                'Start and end time are required',
                'warn'
            );
            return false;
        }

        if (this.draftSlot.startTime >= this.draftSlot.endTime) {
            this.showMessage(
                'Validation',
                'End time must be after start time',
                'warn'
            );
            return false;
        }

        // Check for time overlaps with existing slots
        if (!this.isSlotTimeValidForDays(this.draftSlot)) {
            this.showMessage(
                'Validation',
                'Time slot overlaps with existing schedule',
                'warn'
            );
            return false;
        }

        return true;
    }

    /**
     * Returns the appropriate slot list based on mode.
     * Embedded mode uses @Input slotList directly.
     * Dialog mode uses workingSlotList.
     * PUBLIC - used in template.
     */
    getActiveSlotList(): OperatingHourSlot[] {
        return this.isEmbedded ? this.slotList : this.workingSlotList;
    }

    /**
     * Emits the updated slot list to parent.
     */
    private emitSlotsUpdate(): void {
        this.slotsUpdated.emit([...this.slotList]);
    }

    /**
     * Checks if the proposed slot would overlap with any existing slots
     * for the same days.
     * 
     * WHY: We can't have 9-5 and 2-6 on Monday - they overlap.
     * But 9-5 Monday and 9-5 Tuesday is fine.
     */
    private isSlotTimeValidForDays(proposedSlot: OperatingHourSlot): boolean {
        const activeSlots = this.getActiveSlotList();
        
        for (const day of proposedSlot.selectedDays) {
            // Find all existing slots that include this day
            const existingSlotsForDay = activeSlots.filter((slot) =>
                slot.selectedDays.includes(day)
            );

            // Check each for time overlap
            for (const existingSlot of existingSlotsForDay) {
                if (this.doTimeSlotsOverlap(proposedSlot, existingSlot)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks if two time slots overlap.
     * Overlap occurs if: slot1.start < slot2.end AND slot1.end > slot2.start
     * 
     * Example overlaps:
     * - 9:00-12:00 and 10:00-14:00 (overlap 10-12)
     * - 9:00-17:00 and 12:00-13:00 (second is inside first)
     * 
     * Example non-overlaps:
     * - 9:00-12:00 and 12:00-15:00 (back-to-back is OK)
     * - 9:00-10:00 and 14:00-15:00 (separate times)
     */
    private doTimeSlotsOverlap(
        slot1: OperatingHourSlot,
        slot2: OperatingHourSlot
    ): boolean {
        return slot1.startTime < slot2.endTime && slot1.endTime > slot2.startTime;
    }

    /**
     * Confirms the draft slot and adds it to the list.
     * Resets the draft form after successful addition.
     * In embedded mode, emits immediately. In dialog mode, waits for saveAndClose.
     */
    confirmSlot(): void {
        if (!this.validateDraftSlot()) return;

        const newSlot: OperatingHourSlot = {
            ...this.draftSlot,
            id: `slot_${this.slotCounter++}`,
        };

        if (this.isEmbedded) {
            // Embedded mode: directly update parent's slotList
            this.slotList.push(newSlot);
            this.emitSlotsUpdate();
        } else {
            // Dialog mode: update working copy
            this.workingSlotList.push(newSlot);
        }

        this.draftSlot = this.createEmptySlot();
    }

    /**
     * Removes a slot or a specific day from a slot.
     * If editing an existing screen, triggers API delete. Otherwise just removes locally.
     * 
     * @param slot - The slot to remove from
     * @param dayValue - Specific day to remove (undefined = remove entire slot)
     */
    removeSlot(slot: OperatingHourSlot, dayValue?: number): void {
        // For new screens (no screenId), just remove locally
        if (this.screenId === null) {
            this.removeSlotLocally(slot, dayValue);
            return;
        }

        // For existing screens, find matching DB records to delete
        const recordsToDelete = this.findMatchingOperatingHours(slot, dayValue);

        if (recordsToDelete.length === 0) {
            // No DB records to delete, just remove locally
            this.removeSlotLocally(slot, dayValue);
            return;
        }

        // Show confirmation and delete from API
        this.confirmAndDeleteFromApi(slot, dayValue, recordsToDelete);
    }

    /**
     * Finds operating hour records in the database that match this slot.
     * Used to determine which records to delete when removing a slot.
     */
    private findMatchingOperatingHours(
        slot: OperatingHourSlot,
        dayValue?: number
    ): ScreenOperatingHour[] {
        const daysToMatch =
            dayValue !== undefined ? [dayValue] : slot.selectedDays;

        return this.existingOperatingHours.filter((hour) => {
            const matchesDay = daysToMatch.includes(hour.dayOfWeek);
            const matchesTime =
                hour.startTime.startsWith(slot.startTime) &&
                hour.endTime.startsWith(slot.endTime);

            return matchesDay && matchesTime;
        });
    }

    /**
     * Shows confirmation dialog and deletes operating hours from API.
     * Updates local state and database record list on success.
     */
    private confirmAndDeleteFromApi(
        slot: OperatingHourSlot,
        dayValue: number | undefined,
        recordsToDelete: ScreenOperatingHour[]
    ): void {
        const confirmMessage = this.buildDeleteConfirmMessage(slot, dayValue);

        this.confirmAction({
            message: confirmMessage,
            header: 'Remove Operating Hours',
            accept: () => {
                this.executeDeleteOperations(slot, dayValue, recordsToDelete);
            },
        });
    }

    /**
     * Builds user-friendly confirmation message for delete.
     */
    private buildDeleteConfirmMessage(
        slot: OperatingHourSlot,
        dayValue?: number
    ): string {
        const dayLabel =
            dayValue !== undefined
                ? this.getDayLabel(dayValue)
                : this.getSelectedDayLabels(slot);

        return `Remove operating hours for ${dayLabel}?`;
    }

    /**
     * Executes parallel delete API calls for all matching operating hours.
     * Uses forkJoin to wait for all deletes to complete.
     * 
     * WHY forkJoin: We need to delete multiple records (e.g., Mon-Fri = 5 deletes).
     * forkJoin waits for all to finish before proceeding.
     */
    private executeDeleteOperations(
        slot: OperatingHourSlot,
        dayValue: number | undefined,
        recordsToDelete: ScreenOperatingHour[]
    ): void {
        const deleteObservables = recordsToDelete.map((record) =>
            this.screenService.deleteOperatingHour(record.id, this.screenId!)
        );

        forkJoin(deleteObservables)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage(
                        'Success',
                        'Operating hours removed successfully',
                        'success'
                    );
                    
                    // Update local state
                    this.removeSlotLocally(slot, dayValue);
                    
                    // Update database record list to keep it in sync
                    this.updateExistingOperatingHours(recordsToDelete);
                },
                error: (error: any) => {
                    this.showMessage(
                        'Error',
                        error?.message || 'Failed to delete operating hours',
                        'error'
                    );
                },
            });
    }

    /**
     * Removes deleted records from the existingOperatingHours list.
     * Keeps our local cache in sync with the database.
     */
    private updateExistingOperatingHours(
        deletedRecords: ScreenOperatingHour[]
    ): void {
        const deletedIds = new Set(deletedRecords.map((r) => r.id));
        
        this.existingOperatingHours = this.existingOperatingHours.filter(
            (hour) => !deletedIds.has(hour.id)
        );
    }

    /**
     * Removes a slot or specific day from the slot list (local state only).
     * No API calls - just updates the UI.
     */
    private removeSlotLocally(
        slot: OperatingHourSlot,
        dayValue?: number
    ): void {
        const activeSlots = this.getActiveSlotList();
        
        if (dayValue !== undefined) {
            // Remove only this specific day from the slot
            slot.selectedDays = slot.selectedDays.filter((d) => d !== dayValue);

            // If no days left, remove the entire slot
            if (slot.selectedDays.length === 0) {
                if (this.isEmbedded) {
                    this.slotList = this.slotList.filter((s) => s.id !== slot.id);
                } else {
                    this.workingSlotList = this.workingSlotList.filter((s) => s.id !== slot.id);
                }
            }
        } else {
            // Remove the entire slot
            if (this.isEmbedded) {
                this.slotList = this.slotList.filter((s) => s.id !== slot.id);
            } else {
                this.workingSlotList = this.workingSlotList.filter((s) => s.id !== slot.id);
            }
        }

        // Emit update in embedded mode
        if (this.isEmbedded) {
            this.emitSlotsUpdate();
        }
    }

    /**
     * Returns a comma-separated list of day labels for a slot.
     * Used for display in the table and confirmation messages.
     */
    getSelectedDayLabels(slot: OperatingHourSlot): string {
        if (!slot.selectedDays?.length) return 'No days selected';

        return this.dayOptions
            .filter((d) => slot.selectedDays.includes(d.value))
            .map((d) => d.label)
            .join(', ');
    }

    /**
     * Returns the label for a specific day value.
     */
    getDayLabel(dayValue: number): string {
        return this.dayOptions.find((d) => d.value === dayValue)?.label || '';
    }

    /**
     * Returns array of day objects for a slot (for ngFor in template).
     * Filters dayOptions to only include days selected in this slot.
     */
    getSlotDayRows(slot: OperatingHourSlot): { label: string; value: number }[] {
        return this.dayOptions.filter((d) => slot.selectedDays.includes(d.value));
    }

    /**
     * TrackBy function for ngFor optimization.
     * Prevents unnecessary re-renders when slot list changes.
     */
    trackBySlotId(index: number, slot: OperatingHourSlot): string {
        return slot.id;
    }

    /**
     * Saves changes and emits updated slots back to parent.
     * ONLY USED IN DIALOG MODE.
     */
    saveAndClose(): void {
        if (this.workingSlotList.length === 0) {
            this.showMessage(
                'Validation',
                'Add at least one operating hour slot',
                'warn'
            );
            return;
        }

        // Emit to parent
        this.slotsUpdated.emit(this.workingSlotList);
        
        this.close();
    }

    /**
     * Cancels changes and closes dialog without emitting.
     */
    cancel(): void {
        this.close();
    }

    /**
     * Closes the dialog and resets state.
     * ONLY USED IN DIALOG MODE.
     */
    private close(): void {
        this.isVisible = false;
        this.workingSlotList = [];
        this.draftSlot = this.createEmptySlot();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}