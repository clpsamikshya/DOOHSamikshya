import { Component, Injector, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';

import { Campaign, CampaignMediaGroup, CampaignMediaItem } from '../../Model/Campaign';
import { CampaignStatus } from '../../Model/CampaignEnum';


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

    /* OPEN  */
    show(campaign: Campaign): void {
        this.campaign = campaign;

        this.isShow = true;

        this.loadData(campaign.id);
    }

    /* LOAD  */
    loadData(id: number): void {
        this.isLoading = true;

        this.campaignService.getCampaigns({
            campaignId: id,
            offset: 0,
            pageSize: 1,
            search: '',
            status: null,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res: any) => {

                const data = res?.data?.data?.[0];

                if (!data) {
                    this.isLoading = false;
                    return;
                }

                this.campaign = {
                    ...data,

                    dateRanges: data?.date ?? [],

                    screen: (data?.screen ?? []).map((s: any) => ({
                        id: s?.id ?? s?.Id,
                        campaignId: s?.campaignId ?? s?.CampaignId,
                        screenId: s?.screenId ?? s?.ScreenId,
                        screenName: s?.screenName ?? s?.ScreenName ?? '—',
                        isDeleted: s?.isDeleted ?? false,
                    })),

                    campaignMedia: (data?.campaignMedia ?? []).map((cm: any) => {

                        const group = new CampaignMediaGroup();

                        group.screenId = cm?.screenId ?? cm?.ScreenId;
                        group.screenName = cm?.screenName ?? cm?.ScreenName ?? '—';
                        group.playDate = cm?.playDate ?? '';
                        group.createdAt = cm?.createdAt ?? '';
                        group.createdBy = cm?.createdBy ?? 0;

                        group.media = (cm?.media ?? []).map((m: any) => {

                            const item = new CampaignMediaItem();

                            item.id = m?.id ?? m?.Id;
                            item.mediaId = m?.mediaId ?? m?.MediaId;
                            item.mediaName = m?.mediaName ?? '—';
                            item.mediaType = m?.mediaType ?? false;
                            item.playOrder = Number(m?.playOrder ?? 1);
                            item.Url = m?.url ?? '';

                            return item;
                        });

                        return group;
                    }),

                    screenIds: (data?.screen ?? []).map(
                        (s: any) => s?.screenId ?? s?.ScreenId
                    ),
                } as Campaign;

                this.isLoading = false;
            },

            error: (err) => {
                this.isLoading = false;
                this.showMessage('Error', err.message, 'error');
            }
        });
    }

    getStatusSeverity(status: number) {
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

    getMediaTypeLabel(isVideo: boolean): string {
        return isVideo ? 'Video' : 'Image';
    }

    getMediaTypeSeverity(isVideo: boolean): 'info' | 'success' {
        return isVideo ? 'info' : 'success';
    }

    getStatusLabel(status: number): string {
        return (
            this.statusOptions.find(s => s.value === status)?.label ?? 'Unknown'
        );
    }

    /* CLOSE */
    close(): void {
        this.isShow = false;
        this.campaign = null;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}