import {
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Campaign, CampaignDate, CampaignInsert } from '../../Model/Campaign';
import { CampaignStatus } from '../../Model/CampaignEnum';
import { Subject, takeUntil } from 'rxjs';
import { sharedImports } from '../../../shared/sharedImports';
import { ScreenInfoComponent } from '../../../screens/Component/screen-info/screen-info.component';

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

  CampaignStatus = CampaignStatus;

  statusOptions = [
    { label: 'New', value: CampaignStatus.New },
    { label: 'Active', value: CampaignStatus.Active },
    { label: 'Completed', value: CampaignStatus.Completed },
    { label: 'Paused', value: CampaignStatus.Paused },
    { label: 'Cancelled', value: CampaignStatus.Cancelled },
  ];

  constructor(injector: Injector) {
    super(injector);

    // tomorrow date (used for limits)
    const d = new Date();
    d.setDate(d.getDate() + 1);
    this.tomorrow = d;
  }

  ngOnInit(): void {}

  // open the form (add or edit)
  onShow(data?: Campaign): void {
    this.activeStep = 0;
    this.isSubmitting = false;
    this.hasDateOverlap = false;
    this.screenSearch = '';

    // if editing, copy data, else create new
    this.campaign = data
      ? { ...data, screenIds: [...(data.screenIds ?? [])] }
      : new Campaign();

    // make sure date exists
    if (!this.campaign.dateRanges?.length) {
      this.campaign.dateRanges = [new CampaignDate()];
    }

    // make sure screen list exists
    if (!this.campaign.screenIds) {
      this.campaign.screenIds = [];
    }

    this.isActive = true;
    this.loadScreens();
  }

  // get all screens
  loadScreens(): void {
    this.screensLoading = true;

    this.screenService
      .getAll({} as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.screens = res.data?.data ?? [];
          this.filteredScreens = this.screens;
          this.screensLoading = false;
        },
        error: () => {
          this.screensLoading = false;
        },
      });
  }

  // search screens by name
  filterScreens(): void {
    const search = this.screenSearch?.toLowerCase() || '';

    this.filteredScreens = this.screens.filter((s) =>
      s.name?.toLowerCase().includes(search)
    );
  }

  // check if screen is selected
  isScreenSelected(id: number): boolean {
    return this.campaign.screenIds.includes(id);
  }

  // select or unselect one screen
  toggleScreen(screen: any): void {
    if (screen.status !== 1) return;

    const exists = this.campaign.screenIds.includes(screen.id);

    if (exists) {
      this.campaign.screenIds = this.campaign.screenIds.filter(
        (x) => x !== screen.id
      );
    } else {
      this.campaign.screenIds.push(screen.id);
    }
  }

  // select or unselect all screens
  toggleAllScreens(checked: boolean): void {
    this.campaign.screenIds = checked
      ? this.screens.filter((s) => s.status === 1).map((s) => s.id)
      : [];
  }

  // check if all active screens are selected
  get allScreensSelected(): boolean {
    const active = this.screens.filter((s) => s.status === 1);

    return (
      active.length > 0 &&
      active.every((s) => this.campaign.screenIds.includes(s.id))
    );
  }

  // open screen details popup
  openScreenInfo(screen: any): void {
    this.screenInfo?.show(screen.id);
  }

  // get screen name using id
  getScreenName(id: number): string {
    return this.screens.find((s) => s.id === id)?.name ?? String(id);
  }

  // add a new date row
  addDateRange(): void {
    this.campaign.dateRanges.push(new CampaignDate());
  }

  // remove a date row
  removeDateRange(index: number): void {
    this.campaign.dateRanges.splice(index, 1);
    this.checkOverlap();
  }

  // when user changes date
  onDateChange(): void {
    this.checkOverlap();
  }

  // check if dates overlap
  checkOverlap(): void {
    this.hasDateOverlap = false;

    const ranges = this.campaign.dateRanges;

    for (let i = 0; i < ranges.length; i++) {
      if (!ranges[i].startDateTime || !ranges[i].endDateTime) continue;

      const aStart = new Date(ranges[i].startDateTime!).getTime();
      const aEnd = new Date(ranges[i].endDateTime!).getTime();

      for (let j = i + 1; j < ranges.length; j++) {
        if (!ranges[j].startDateTime || !ranges[j].endDateTime) continue;

        const bStart = new Date(ranges[j].startDateTime!).getTime();
        const bEnd = new Date(ranges[j].endDateTime!).getTime();

        // if they overlap, mark error
        if (aStart <= bEnd && aEnd >= bStart) {
          this.hasDateOverlap = true;
          return;
        }
      }
    }
  }

  // get days between two dates
  getDurationDays(d: CampaignDate): number {
    if (!d.startDateTime || !d.endDateTime) return 0;

    const diff =
      new Date(d.endDateTime).getTime() -
      new Date(d.startDateTime).getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // total days of campaign
  get totalDurationDays(): number {
    return this.campaign.dateRanges.reduce(
      (sum, d) => sum + this.getDurationDays(d),
      0
    );
  }

  // go to next step
  goNext(): void {
    if (
      this.campaign.status === null ||
      this.campaign.status === undefined
    ) {
      this.showMessage('Error', 'Please select status', 'error');
      return;
    }

    if (this.activeStep === 0 && !this.campaign.name?.trim()) {
      this.showMessage('Error', 'Enter campaign name', 'error');
      return;
    }

    if (this.activeStep === 1) {
      const hasValid = this.campaign.dateRanges.some(
        (d) => d.startDateTime && d.endDateTime
      );

      if (!hasValid) {
        this.showMessage('Error', 'Add a valid date', 'error');
        return;
      }

      if (this.hasDateOverlap) {
        this.showMessage('Error', 'Dates are overlapping', 'error');
        return;
      }
    }

    if (this.activeStep === 2 && !this.campaign.screenIds.length) {
      this.showMessage('Error', 'Select at least one screen', 'error');
      return;
    }

    this.activeStep++;
  }

  // go back step
  goBack(): void {
    this.activeStep--;
  }

  // save campaign
  onSubmit(): void {
    this.confirmAction({
      message: 'Do you want to save this campaign?',
      header: 'Confirm',

      accept: () => {
        this.isSubmitting = true;

        const payload = this.mapToCampaignInsert(this.campaign);

        this.campaignService
          .add(payload)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              this.isSubmitting = false;
              this.showMessage('Success', 'Saved successfully', 'success');
              this.onSave.emit(res.data);
              this.isActive = false;
            },
            error: (err) => {
              this.isSubmitting = false;
              this.showMessage('Error', err.message, 'error');
            },
          });
      },

      reject: () => {
        this.showMessage('Cancelled', 'Save cancelled', 'info');
      },
    });
  }

  // convert data for backend
  private toLocalISO(date: Date | null): any {
    if (!date) return null;

    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}
T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  // build request for API
  mapToCampaignInsert(campaign: Campaign): any {
    return {
      tenantId: 1,
      name: campaign.name,
      status: 1,
      remarks: campaign.remarks,
      createdBy: 1,

      date: campaign.dateRanges
        .filter((d) => d.startDateTime && d.endDateTime)
        .map((d) => ({
          startDateTime: this.toLocalISO(d.startDateTime),
          endDateTime: this.toLocalISO(d.endDateTime),
        })),

      screen: campaign.screenIds.map((id) => ({
        screenId: id,
      })),
    };
  }

  // close form
  onCancel(): void {
    this.isActive = false;
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}