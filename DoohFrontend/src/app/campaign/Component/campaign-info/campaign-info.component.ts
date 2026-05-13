import { Component, Injector, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';

import { sharedImports } from '../../../shared/sharedImports';

import {
    Campaign,
    CampaignMediaGroup,
    CampaignMediaItem,
} from '../../Model/Campaign';

import { CampaignStatus } from '../../Model/CampaignEnum';

import { CampaignMediaInfoComponent } from '../campaign-media/campaign-media-info/campaign-media-info.component';

@Component({
    selector: 'campaign-info',
    standalone: true,
    imports: [...sharedImports, CampaignMediaInfoComponent],
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
                    console.log('Full API response:', res);

                    const raw = res.data?.data?.[0] as any;

                    console.log('Raw campaign:', raw);
                    console.log('Raw screen data:', raw?.screen);
                    console.log('Raw campaign media:', raw?.campaignMedia);

                    if (raw) {
                        this.campaign = {
                            ...raw,

                            dateRanges: raw.date ?? raw.dateRanges ?? [],

                            screen: (raw.screen ?? []).map((s: any) => ({
                                id: s.id ?? s.Id,
                                campaignId: s.campaignId ?? s.CampaignId,
                                screenId: s.screenId ?? s.ScreenId,
                                screenName: s.screenName ?? s.ScreenName ?? '—',
                                isDeleted: s.isDeleted ?? s.IsDeleted ?? false,
                            })),

                            campaignMedia: (
                                raw.campaignMedia ??
                                raw.CampaignMedia ??
                                []
                            ).map((cm: any) => {
                                const mediaGroup = new CampaignMediaGroup();

                                mediaGroup.screenId =
                                    cm.screenId ?? cm.ScreenId;
                                mediaGroup.screenName =
                                    cm.screenName ?? cm.ScreenName ?? '—';
                                mediaGroup.playDate =
                                    cm.playDate ?? cm.PlayDate ?? '';

                                mediaGroup.createdAt =
                                    cm.createdAt ?? cm.CreatedAt ?? '';
                                mediaGroup.createdBy =
                                    cm.createdBy ?? cm.CreatedBy ?? 0;

                                mediaGroup.media = (
                                    cm.media ??
                                    cm.Media ??
                                    []
                                ).map((m: any) => {
                                    const media = new CampaignMediaItem();

                                    media.id = m.id ?? m.Id;
                                    media.mediaId = m.mediaId ?? m.MediaId;

                                    media.mediaName =
                                        m.mediaName ?? m.MediaName ?? '—';
                                    media.mediaType =
                                        m.mediaType ?? m.MediaType ?? false;

                                    media.playOrder = Number(
                                        m.playOrder ?? m.PlayOrder ?? 1,
                                    );

                                    media.createdAt =
                                        m.createdAt ?? m.CreatedAt ?? '';
                                    media.createdBy =
                                        m.createdBy ?? m.CreatedBy ?? 0;

                                    media.Url = m.url ?? '';

                                    return media;
                                });

                                return mediaGroup;
                            }),

                            screenIds: (raw.screen ?? []).map(
                                (s: any) => s.screenId ?? s.ScreenId,
                            ),
                        };
                    }

                    this.isLoading = false;
                },

                error: (err) => {
                    this.isLoading = false;

                    this.showMessage('Error', err.message, 'error');
                },
            });
    }
// openMedia(url: string, isVideo: boolean): void {
//     if (isVideo) {
//         window.open(url, '_blank');
//     } else {
//         window.open(url, '_blank');
//     }
// }
    getMediaTypeLabel(isVideo: boolean): string {
        return isVideo ? 'Video' : 'Image';
    }

    getMediaTypeSeverity(isVideo: boolean): 'info' | 'success' {
        return isVideo ? 'info' : 'success';
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
