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
} from '../../../Model/CampaignMedia';
import { DropdownItemScreen } from '../../../../screens/model/Screen';
import { DropdownItemMedia } from '../../../../media/model/MediaLibrary';

export interface SelectedMediaItem {
    mediaId: number;
    name: string;
    playOrder: number;
}

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

    // Multi-select: tracks selected media ids from p-multiSelect
    selectedMediaIds: number[] = [];

    // Per-item play order list built from selectedMediaIds
    selectedMediaItems: SelectedMediaItem[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    // Called from parent to open the dialog
    show(campaignId: number, data?: CampaignMedia): void {
        this.existingData = data ?? null;
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
        this.campaignMedia.duration = data?.duration ?? 0;

        // Reset multi-select state
        this.selectedMediaIds = [];
        this.selectedMediaItems = [];

        // If editing, pre-populate with the single existing media
        if (data?.mediaId) {
            this.selectedMediaIds = [data.mediaId];
            this.selectedMediaItems = [
                {
                    mediaId: data.mediaId,
                    name: '', // will be resolved after mediaOptions loads
                    playOrder: data.order ?? 1,
                },
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
                error: (err) => {
                    this.showMessage('Error', err.message, 'error');
                },
            });
    }

    // loadMediaOptions(campaignId: number): void {
    //     this.mediaLibraryService
    //         .getMediaLibraryDdl(campaignId)
    //         .pipe(takeUntil(this.destroy$))
    //         .subscribe({
    //             next: (res) => {
    //                 this.mediaOptions = res?.data || [];
    //                 // Resolve names for any pre-populated items
    //                 this.selectedMediaItems = this.selectedMediaItems.map(
    //                     (item) => ({
    //                         ...item,
    //                         name:
    //                             this.mediaOptions.find(
    //                                 (m) => m.id === item.mediaId,
    //                             )?.name || item.name,
    //                     }),
    //                 );
    //             },
    //             error: (err) => {
    //                 this.showMessage('Error', err.message, 'error');
    //             },
    //         });
    // }

    loadMediaOptions(campaignId: number): void {
    this.mediaLibraryService
        .getMediaLibraryDdl(campaignId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res) => {
                const raw = res?.data || [];

                // Map API fields explicitly — adjust key names to match your actual API response
                this.mediaOptions = raw.map((x: any) => ({
                    id: x.id ?? x.mediaId,
                    name: x.name ?? x.mediaName ?? x.fileName ?? '',
                    url: x.url ?? x.mediaUrl ?? x.filePath ?? x.thumbnailUrl ?? '',
                    mediaType: x.mediaType ?? x.type ?? x.fileType ?? '',
                    fileSize: x.fileSize ?? x.size ?? '',
                    duration: x.duration ?? '',
                }));

                console.log('mediaOptions:', this.mediaOptions); // ← check url + mediaType here

                // Resolve names for pre-populated items
                this.selectedMediaItems = this.selectedMediaItems.map((item) => ({
                    ...item,
                    name: this.mediaOptions.find((m) => m.id === item.mediaId)?.name || item.name,
                }));
            },
            error: (err) => {
                this.showMessage('Error', err.message, 'error');
            },
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
                        ...x,
                        playOrder: x.playOrder ?? x.PlayOrder ?? 0,
                        url: x.url ?? x.mediaUrl ?? x.filePath ?? '',
                        mediaName: x.mediaName ?? x.name ?? x.fileName ?? '',
                    }));
                    this.sortMediaInfoData();
                },
                error: (err) => {
                    this.showMessage(
                        'Error',
                        err.error?.message || err.message,
                        'error',
                    );
                },
            });
    }

    onMediaSelectionChange(newItems: DropdownItemMedia[]): void {
    this.selectedMediaFull = newItems;
    const newIds = newItems.map(i => i.id);
    const currentIds = new Set(this.selectedMediaItems.map(i => i.mediaId));
    const incoming = new Set(newIds);

    this.selectedMediaItems = this.selectedMediaItems.filter(i => incoming.has(i.mediaId));

    newItems.forEach(item => {
        if (!currentIds.has(item.id)) {
            this.selectedMediaItems.push({
                mediaId: item.id,
                name: item.name,
                playOrder: this.nextPlayOrder(),
            });
        }
    });

    this.selectedMediaIds = newIds;
}

    nextPlayOrder(): number {
        const screenId = this.campaignMedia.screenId;
        const playDate = this.campaignMedia.playDate;

        const savedOrders = this.mediaInfoData
            .filter(
                (x) =>
                    x.screenId === screenId &&
                    this.formatDate(x.playDate) === playDate,
            )
            .map((x) => x.playOrder as number);

        // Orders already assigned in the current form selection
        const formOrders = this.selectedMediaItems.map((i) => i.playOrder);

        const allOrders = [...savedOrders, ...formOrders];
        return allOrders.length > 0 ? Math.max(...allOrders) + 1 : 1;
    }

    onScreenOrDateChange(): void {
        if (!this.selectedMediaItems.length) return;

        const screenId = this.campaignMedia.screenId;
        const playDate = this.campaignMedia.playDate;

        const savedMax = this.mediaInfoData
            .filter(
                (x) =>
                    x.screenId === screenId &&
                    this.formatDate(x.playDate) === playDate,
            )
            .reduce((max, x) => Math.max(max, x.playOrder ?? 0), 0);

        // Re-number existing selections starting after saved max
        this.selectedMediaItems = this.selectedMediaItems.map((item, idx) => ({
            ...item,
            playOrder: savedMax + idx + 1,
        }));
    }

    onPlayOrderChange(row: any): void {
        if (!row.playOrder || row.playOrder < 1) return;

        const request: any = {
            campaignId: row.campaignId ?? this.campaignMedia.campaignId,
            screenId: row.screenId,
            playDate: row.playDate, // ✅ use raw playDate from API, no formatting
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
                error: (err) => {
                    this.showMessage(
                        'Error',
                        err.error?.message || err.message,
                        'error',
                    );
                },
            });
    }

    deleteMediaRow(row: any): void {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const recordId = row.id;

        this.campaignMediaService
            .deleteCampaignMedia(recordId, 1)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage(
                        'Success',
                        'Deleted successfully',
                        'success',
                    );
                    this.mediaInfoData = this.mediaInfoData.filter(
                        (x) => x.id !== recordId,
                    ); // ✅ filter by record id
                },
                error: (err) => {
                    this.showMessage(
                        'Error',
                        err.error?.message || err.message,
                        'error',
                    );
                },
            });
    }

    onSubmit(): void {
        if (!this.campaignMedia.screenId) {
            alert('Select a screen');
            return;
        }
        if (!this.selectedMediaItems.length) {
            alert('Select at least one media');
            return;
        }
        if (!this.campaignMedia.playDate) {
            alert('Select a play date');
            return;
        }
        if (!this.campaignMedia.startTime) {
            alert('Select a start time');
            return;
        }
        if (!this.campaignMedia.endTime) {
            alert('Select an end time');
            return;
        }

        // Validate no duplicate play orders within this submission
        const orders = this.selectedMediaItems.map((i) => i.playOrder);
        const hasDuplicates = orders.length !== new Set(orders).size;
        if (hasDuplicates) {
            alert('Each selected media must have a unique play order');
            return;
        }

        const f = this.campaignMedia;
        const request: CampaignMediaRequest = {
            campaignId: f.campaignId,
            screenId: f.screenId,
            playDate: f.playDate,
            createdBy: 1,
            media: this.selectedMediaItems.map((item) => ({
                mediaId: item.mediaId,
                playOrder: item.playOrder,
            })),
        };

        const call$ = this.existingData
            ? this.campaignMediaService.updatecampaignMedia(request)
            : this.campaignMediaService.addCampaignMedia(request);

        const successMsg = this.existingData
            ? 'Campaign media updated successfully'
            : 'Campaign media added successfully';

        call$.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.showMessage('Success', successMsg, 'success');
                this.isShow = false;
                this.onSave.emit();
            },
            error: (err) => {
                this.showMessage(
                    'Error',
                    err.error?.message || err.message,
                    'error',
                );
            },
        });
    }

    isVideo(url: string): boolean {
        if (!url) return false;
        const result= /\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(url);
        console.log('isVideo:', url, '->', result); 
        return result;
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
    }

    private sortMediaInfoData(): void {
        // Sort by screen, then date, then play order for clear grouping
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
