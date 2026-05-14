import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { sharedImports } from '../../../../shared/sharedImports';
import { AppComponent } from '../../../../app.component';
import {
    CampaignMedia,
    CampaignMediaForm,
    CampaignMediaRequest,
    SelectedMediaItem,
} from '../../../Model/CampaignMedia';
import { DropdownItemScreen } from '../../../../screens/model/Screen';
import { DropdownItemMedia } from '../../../../media/model/MediaLibrary';

@Component({
    selector: 'add-edit-campaign-media',
    standalone: true,
    imports: [...sharedImports],
    templateUrl: './add-edit-campaign-media.component.html',
    styleUrl: './add-edit-campaign-media.component.scss',
})
export class AddEditCampaignMediaComponent
    extends AppComponent
    implements OnInit, OnDestroy
{
    @Output() onSave = new EventEmitter<void>();

    private destroy$ = new Subject<void>();

    isShow = false;
    existingData: CampaignMedia | null = null;

    campaignMedia: CampaignMediaForm = new CampaignMediaForm();
    screenOptions: DropdownItemScreen[] = [];
    mediaOptions: DropdownItemMedia[] = [];
    mediaInfoData: any[] = [];
    selectedMediaFull: DropdownItemMedia[] = [];
    selectedMediaIds: number[] = [];
    selectedMediaItems: SelectedMediaItem[] = [];
    campaignDateRanges: { startDateTime: string; endDateTime: string }[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    // Open the form dialog
    show(
        campaignId: number,
        dateRanges: { startDateTime: string; endDateTime: string }[],
        data?: CampaignMedia,
    ): void {
        this.existingData = data ?? null;
        this.campaignDateRanges = dateRanges ?? [];
        this.initializeForm(campaignId, data);
        this.loadScreenOptions(campaignId);
        this.loadMediaOptions(campaignId);
        this.loadMediaInfo(campaignId);
        this.isShow = true;
    }

    initializeForm(campaignId: number, data?: CampaignMedia): void {
        this.campaignMedia = new CampaignMediaForm();
        this.campaignMedia.campaignId = campaignId;
        this.campaignMedia.screenId = data?.screenId ?? 0;
        this.campaignMedia.playDate = data?.playDate
            ? this.formatDate(data.playDate)
            : '';
        this.campaignMedia.startTime = data?.startTime
            ? this.formatTime(data.startTime)
            : '';
        this.campaignMedia.endTime = data?.endTime
            ? this.formatTime(data.endTime)
            : '';

        this.selectedMediaIds = [];
        this.selectedMediaItems = [];
        this.selectedMediaFull = [];

        if (data?.mediaId) {
            this.selectedMediaIds = [data.mediaId];
            this.selectedMediaItems = [
                { mediaId: data.mediaId, name: '', playOrder: data.order ?? 1 },
            ];
        }
    }

    loadScreenOptions(campaignId: number): void {
        this.screenService
            .getScreenDdl(campaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.screenOptions = res?.data || [];
                },
                error: (err) => this.showMessage('Error', err.message, 'error'),
            });
    }

    loadMediaOptions(campaignId: number): void {
        this.mediaLibraryService
            .getMediaLibraryDdl(campaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const raw = res?.data || [];
                    this.mediaOptions = raw.map((x: any) => ({
                        id: x.id ?? x.mediaId,
                        name: x.name ?? x.mediaName ?? x.fileName ?? '',
                        url:
                            x.url ??
                            x.mediaUrl ??
                            x.filePath ??
                            x.thumbnailUrl ??
                            '',
                        mediaType: x.mediaType ?? x.type ?? x.fileType ?? '',
                        fileSize: x.fileSize ?? x.size ?? '',
                    }));

                    this.selectedMediaItems = this.selectedMediaItems.map(
                        (item) => ({
                            ...item,
                            name:
                                this.mediaOptions.find(
                                    (m) => m.id === item.mediaId,
                                )?.name || item.name,
                        }),
                    );
                },
                error: (err) => this.showMessage('Error', err.message, 'error'),
            });
    }

    loadMediaInfo(campaignId: number): void {
        this.campaignMediaService
            .getCampaignMedia({ campaignId })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    const raw = res?.data?.data || [];
                    this.mediaInfoData = raw.map((x: any) => ({
                        id: x.id,
                        campaignId: x.campaignId ?? campaignId,
                        mediaId: x.mediaId,
                        screenId: x.screenId,
                        screenName: x.screenName ?? '',
                        playDate: x.playDate,
                        playOrder: x.playOrder ?? 0,
                        url: x.url ?? x.mediaUrl ?? x.filePath ?? '',
                        mediaName: x.mediaName ?? x.name ?? x.fileName ?? '',
                    }));
                    this.sortMediaInfoData();
                },
                error: (err) =>
                    this.showMessage(
                        'Error',
                        err.error?.message || err.message,
                        'error',
                    ),
            });
    }

    onMediaSelectionChange(newItems: DropdownItemMedia[]): void {
        this.selectedMediaFull = newItems;
        this.selectedMediaIds = newItems.map((i) => i.id);
        this.selectedMediaItems = newItems.map((item) => {
            const existing = this.selectedMediaItems.find(
                (x) => x.mediaId === item.id,
            );
            return {
                mediaId: item.id,
                name: item.name,
                playOrder: existing?.playOrder ?? this.getNextPlayOrder(),
            };
        });
    }

    onScreenOrDateChange(): void {
        if (!this.selectedMediaItems.length) return;

        const screenId = this.campaignMedia.screenId;
        const playDate = this.campaignMedia.playDate;

        const maxSavedOrder = this.mediaInfoData
            .filter(
                (x) =>
                    x.screenId === screenId &&
                    this.formatDate(x.playDate) === playDate,
            )
            .reduce((max, x) => Math.max(max, x.playOrder ?? 0), 0);

        this.selectedMediaItems = this.selectedMediaItems.map((item, idx) => ({
            ...item,
            playOrder: maxSavedOrder + idx + 1,
        }));
    }

    onPlayOrderChange(row: any): void {
        if (!row.playOrder || row.playOrder < 1) return;

        const request = {
            campaignId: row.campaignId,
            screenId: row.screenId,
            playDate: row.playDate,
            updatedBy: 1,
            media: [{ mediaId: row.mediaId, playOrder: row.playOrder }],
        };

        this.campaignMediaService
            .updatecampaignMedia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage(
                        'Success',
                        'Play order updated',
                        'success',
                    );
                    this.sortMediaInfoData();
                },
                error: (err) =>
                    this.showMessage(
                        'Error',
                        err.error?.message || err.message,
                        'error',
                    ),
            });
    }

    deleteMediaRow(row: any): void {
        if (!confirm('Are you sure you want to delete this item?')) return;

        this.campaignMediaService
            .deleteCampaignMedia(row.id, 1)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage(
                        'Success',
                        'Deleted successfully',
                        'success',
                    );
                    this.mediaInfoData = this.mediaInfoData.filter(
                        (x) => x.id !== row.id,
                    );
                },
                error: (err) =>
                    this.showMessage(
                        'Error',
                        err.error?.message || err.message,
                        'error',
                    ),
            });
    }

    onSubmit(): void {
        if (!this.campaignMedia.screenId) {
            this.showMessage(
                'Validation Error',
                'Please select a screen',
                'warn',
            );
            return;
        }
        if (!this.selectedMediaItems.length) {
            this.showMessage(
                'Validation Error',
                'Please select at least one media',
                'warn',
            );
            return;
        }
        if (!this.campaignMedia.playDate) {
            this.showMessage(
                'Validation Error',
                'Please select a play date',
                'warn',
            );
            return;
        }

        const orders = this.selectedMediaItems.map((i) => i.playOrder);
        if (orders.length !== new Set(orders).size) {
            alert('Each selected media must have a unique play order');
            return;
        }

        const request: CampaignMediaRequest = {
            campaignId: this.campaignMedia.campaignId,
            screenId: this.campaignMedia.screenId,
            playDate: this.campaignMedia.playDate,
            createdBy: 1,
            media: this.selectedMediaItems.map((item) => ({
                mediaId: item.mediaId,
                playOrder: item.playOrder,
            })),
        };

        if (this.existingData) {
            this.campaignMediaService
                .updatecampaignMedia(request)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.showMessage(
                            'Success',
                            'Campaign media updated successfully',
                            'success',
                        );
                        this.isShow = false;
                        this.onSave.emit();
                    },
                    error: (err) =>
                        this.showMessage(
                            'Error',
                            err.error?.message || err.message,
                            'error',
                        ),
                });
        } else {
            this.campaignMediaService
                .addCampaignMedia(request)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.showMessage(
                            'Success',
                            'Campaign media added successfully',
                            'success',
                        );
                        this.isShow = false;
                        this.onSave.emit();
                    },
                    error: (err) =>
                        this.showMessage(
                            'Error',
                            err.error?.message || err.message,
                            'error',
                        ),
                });
        }
    }

    cancel(): void {
        this.isShow = false;
        this.existingData = null;
        this.campaignMedia = new CampaignMediaForm();
        this.screenOptions = [];
        this.mediaOptions = [];
        this.mediaInfoData = [];
        this.selectedMediaIds = [];
        this.selectedMediaItems = [];
        this.selectedMediaFull = [];
        this.campaignDateRanges = [];
    }

    isVideo(url: string): boolean {
        if (!url) return false;
        return /\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(url);
    }

    private getNextPlayOrder(): number {
        const screenId = this.campaignMedia.screenId;
        const playDate = this.campaignMedia.playDate;

        const savedOrders = this.mediaInfoData
            .filter(
                (x) =>
                    x.screenId === screenId &&
                    this.formatDate(x.playDate) === playDate,
            )
            .map((x) => x.playOrder as number);

        const formOrders = this.selectedMediaItems.map((i) => i.playOrder);
        const allOrders = [...savedOrders, ...formOrders];
        return allOrders.length > 0 ? Math.max(...allOrders) + 1 : 1;
    }

    private sortMediaInfoData(): void {
        this.mediaInfoData.sort((a, b) => {
            if (a.screenId !== b.screenId)
                return (a.screenId ?? 0) - (b.screenId ?? 0);
            const dateA = new Date(a.playDate).getTime();
            const dateB = new Date(b.playDate).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return (a.playOrder ?? 0) - (b.playOrder ?? 0);
        });
    }

    private formatDate(date: string | Date): string {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' : d.toISOString().substring(0, 10);
    }

    private formatTime(time: string): string {
        return time?.substring(0, 5) || '';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
