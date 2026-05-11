import { Component, Injector, OnDestroy } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Campaign } from '../../Model/Campaign';
import { CampaignStatus } from '../../Model/CampaignEnum';
import { sharedImports } from '../../../shared/sharedImports';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'campaign-info',
    standalone: true,
    imports: [...sharedImports],
    templateUrl: './campaign-info.component.html',
    styleUrl: './campaign-info.component.scss',
})
export class CampaignInfoComponent extends AppComponent implements OnDestroy {
    private destroy$ = new Subject<void>();

    isShow = false;
    isLoading = false;
    campaign: Campaign | null = null;
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
    }

    show(campaign: Campaign): void {
        console.log('opening campaign id:', campaign.id);
        this.campaign = campaign;
        this.isShow = true;
        this.loadCampaign(campaign.id);
    }

    loadCampaign(id: number): void {
    this.isLoading = true;
    this.campaignService
        .getCampaigns({
            campaignId: id,
            offset: 0,
            pageSize: 1,
            search: '',
            status: null,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res) => {
                const raw = res.data?.data?.[0] as any;
                if (raw) {
                    this.campaign = {
                        ...raw,
                        dateRanges: raw.date ?? raw.dateRanges ?? [],
                        screen: raw.screen ?? [],
                    };
                    // now load screen names
                    this.loadScreenNames();
                } else {
                    this.campaign = null;
                    this.isLoading = false;
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.showMessage('Error', err.message, 'error');
            },
        });
}

loadScreenNames(): void {
    this.screenService
        .getAll({} as any)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res) => {
                const allScreens = res.data?.data ?? [];
                if (this.campaign) {
                    this.campaign = {
                        ...this.campaign,
                        screen: this.campaign.screen.map((s: any) => ({
                            ...s,
                            screenName: allScreens.find((x: any) => x.id === s.screenId)?.name ?? '—',
                        })),
                    };
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
}

    getStatusLabel(status: number): string {
        return (
            this.statusOptions.find((s) => s.value === status)?.label ??
            'Unknown'
        );
    }

    getStatusSeverity(
        status: number,
    ):
        | 'success'
        | 'info'
        | 'warning'
        | 'danger'
        | 'secondary'
        | 'contrast'
        | undefined {
        switch (status) {
            case CampaignStatus.Active:
                return 'success';
            case CampaignStatus.Paused:
                return 'warning';
            case CampaignStatus.Cancelled:
                return 'danger';
            case CampaignStatus.Completed:
                return 'info';
            default:
                return 'secondary';
        }
    }

    close(): void {
        this.isShow = false;
        this.campaign = null;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
