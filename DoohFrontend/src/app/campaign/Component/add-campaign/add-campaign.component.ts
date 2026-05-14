import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';
import { ScreenInfoComponent } from '../../../screens/Component/screen-info/screen-info.component';

import { Campaign, CampaignDate, CampaignInsert } from '../../Model/Campaign';
import { CampaignStatus } from '../../Model/CampaignEnum';

@Component({
    selector: 'add-edit-campaign',
    standalone: true,
    imports: [sharedImports, ScreenInfoComponent],
    templateUrl: './add-campaign.component.html',
    styleUrl: './add-campaign.component.scss',
})
export class AddCampaignComponent extends AppComponent implements OnInit, OnDestroy {

    @Output() onSave = new EventEmitter<Campaign>();
    @ViewChild('screenInfo') screenInfo!: ScreenInfoComponent;

    private destroy$ = new Subject<void>();

    isActive = false;
    activeStep = 0;
    isSubmitting = false;

    campaign: Campaign = new Campaign();

    screens: any[] = [];
    filteredScreens: any[] = [];
    screenSearch = '';
    screensLoading = false;

    hasDateOverlap = false;
    tomorrow: Date;

    // CampaignStatus = CampaignStatus;

    // statusOptions = [
    //     { label: 'New', value: CampaignStatus.New },
    //     { label: 'Active', value: CampaignStatus.Active },
    //     { label: 'Completed', value: CampaignStatus.Completed },
    //     { label: 'Paused', value: CampaignStatus.Paused },
    //     { label: 'Cancelled', value: CampaignStatus.Cancelled },
    // ];

    constructor(injector: Injector) {
        super(injector);
        const d = new Date();
        d.setDate(d.getDate() + 1);
        this.tomorrow = d;
    }

    ngOnInit(): void {}

    // Called from parent to open the dialog
    show(data?: Campaign): void {
        this.activeStep = 0;
        this.isSubmitting = false;
        this.hasDateOverlap = false;
        this.screenSearch = '';

        this.campaign = data
            ? { ...data, screenIds: [...(data.screenIds ?? [])] }
            : new Campaign();

        if (!this.campaign.dateRanges?.length) {
            this.campaign.dateRanges = [new CampaignDate()];
        }

        if (!this.campaign.screenIds) {
            this.campaign.screenIds = [];
        }

        this.isActive = true;
        this.loadScreens();
    }

    loadScreens(): void {
        this.screensLoading = true;
        this.screenService.getAll({} as any)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.screens = res.data?.data ?? [];
                    this.filteredScreens = this.screens;
                    this.screensLoading = false;
                },
                error: (err) => {
                    this.screensLoading = false;
                    this.showMessage('Error', err?.error?.message || 'Failed to load screens', 'error');
                }
            });
    }

    // FOR Screen  

    filterScreens(): void {
        const search = this.screenSearch?.toLowerCase() || '';
        this.filteredScreens = this.screens.filter(s =>
            s.name?.toLowerCase().includes(search)
        );
    }

    isScreenSelected(id: number): boolean {
        return this.campaign.screenIds.includes(id);
    }

    toggleScreen(screen: any): void {
        if (screen.status !== 1) return;
        if (this.campaign.screenIds.includes(screen.id)) {
            this.campaign.screenIds = this.campaign.screenIds.filter(x => x !== screen.id);
        } else {
            this.campaign.screenIds.push(screen.id);
        }
    }

    toggleAllScreens(checked: boolean): void {
        this.campaign.screenIds = checked
            ? this.screens.filter(s => s.status === 1).map(s => s.id)
            : [];
    }

    get allScreensSelected(): boolean {
        const active = this.screens.filter(s => s.status === 1);
        return active.length > 0 && active.every(s => this.campaign.screenIds.includes(s.id));
    }

    openScreenInfo(screen: any): void {
        this.screenInfo?.show(screen.id);
    }

    getScreenName(id: number): string {
        return this.screens.find(s => s.id === id)?.name ?? String(id);
    }

    // FOR Date range 

    addDateRange(): void {
        this.campaign.dateRanges.push(new CampaignDate());
    }

    removeDateRange(index: number): void {
        this.campaign.dateRanges.splice(index, 1);
        this.checkDateOverlap();
    }

//     private setDefaultTime(date: Date, h: number, m: number, s: number): Date {
//     const d = new Date(date);
//     d.setHours(h, m, s, 0);
//     return d;
// }

    onDateChange(): void {
        // Set default times when date is selected
        this.campaign.dateRanges.forEach(range => {
            if (range.startDateTime) {
                const start = new Date(range.startDateTime);
                // Check if time hasn't been manually set (is midnight)
                const timeString = `${start.getHours()}:${start.getMinutes()}`;
                if (timeString === '0:0') {
                    start.setHours(0, 0, 0, 0);
                    range.startDateTime = start;
                }
            }
            if (range.endDateTime) {
                const end = new Date(range.endDateTime);
                // Check if time hasn't been manually set (is midnight)
                const timeString = `${end.getHours()}:${end.getMinutes()}`;
                if (timeString === '0:0') {
                    end.setHours(23, 59, 0, 0);
                    range.endDateTime = end;
                }
            }
        });
        this.checkDateOverlap();
    }

    checkDateOverlap(): void {
        this.hasDateOverlap = false;
        const ranges = this.campaign.dateRanges;

        for (let i = 0; i < ranges.length; i++) {
            if (!ranges[i].startDateTime || !ranges[i].endDateTime) continue;
            const aStart = new Date(ranges[i].startDateTime!).getTime();
            const aEnd   = new Date(ranges[i].endDateTime!).getTime();

            for (let j = i + 1; j < ranges.length; j++) {
                if (!ranges[j].startDateTime || !ranges[j].endDateTime) continue;
                const bStart = new Date(ranges[j].startDateTime!).getTime();
                const bEnd   = new Date(ranges[j].endDateTime!).getTime();

                if (aStart <= bEnd && aEnd >= bStart) {
                    this.hasDateOverlap = true;
                    return;
                }
            }
        }
    }

    getDurationDays(d: CampaignDate): number {
        if (!d.startDateTime || !d.endDateTime) return 0;
        const diff = new Date(d.endDateTime).getTime() - new Date(d.startDateTime).getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    get totalDurationDays(): number {
        return this.campaign.dateRanges.reduce((sum, d) => sum + this.getDurationDays(d), 0);
    }

    // Stepper next back

    goNext(): void {
        if (this.activeStep === 0) {
            if (!this.campaign.name?.trim()) {
                this.showMessage('Validation Error', 'Campaign name is required', 'warn');
                return;
            }
        }

        if (this.activeStep === 1) {
            const hasValid = this.campaign.dateRanges.some(d => d.startDateTime && d.endDateTime);
            if (!hasValid) {
                this.showMessage('Validation Error', 'At least one complete date range is required', 'warn');
                return;
            }
            if (this.hasDateOverlap) {
                this.showMessage('Validation Error', 'Date ranges must not overlap', 'error');
                return;
            }
        }

        if (this.activeStep === 2) {
            if (!this.campaign.screenIds.length) {
                this.showMessage('Validation Error', 'At least one screen must be selected', 'warn');
                return;
            }
        }

        this.activeStep++;
    }

    goBack(): void {
        // this.activeStep--;
        this.activeStep;
    }

    // Submit the campaign to backend

    onSubmit(): void {
        this.isSubmitting = true;

        const payload: CampaignInsert = {
            tenantId: 1,
            name: this.campaign.name,
            status: CampaignStatus.New,
            remarks: this.campaign.remarks,
            createdBy: 1,
            date: this.campaign.dateRanges
                .filter(d => d.startDateTime && d.endDateTime)
                .map(d => ({
                    startDateTime: this.toLocalISO(d.startDateTime) as string,
                    endDateTime: this.toLocalISO(d.endDateTime) as string,
                })),
            screen: this.campaign.screenIds.map(id => ({ screenId: id })),
        };

        this.campaignService.add(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.isSubmitting = false;
                    this.showMessage('Success', 'Campaign created successfully', 'success');
                    this.isActive = false;
                    this.onSave.emit(res.data);
                },
                error: (err) => {
                    this.isSubmitting = false;
                    this.showMessage('Error', err?.error?.message || err?.message || 'Failed to create campaign', 'error');
                }
            });
    }

    cancel(): void {
        this.isActive = false;
    }

    trackByIndex(index: number): number {
        return index;
    }

    private toLocalISO(date: Date | null): string | null {
        if (!date) return null;
        const d = new Date(date);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}