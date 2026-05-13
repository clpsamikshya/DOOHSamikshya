import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { sharedImports } from '../../../../shared/sharedImports';
import { AppComponent } from '../../../../app.component';

import { forkJoin, Subject, takeUntil } from 'rxjs';

import {
    CampaignMedia,
    CampaignMediaForm,
    CampaignMediaRequest,
} from '../../../Model/CampaignMedia';

import { DropdownItemScreen } from '../../../../screens/model/Screen';
import { DropdownItemMedia } from '../../../../media/model/MediaLibrary';

@Component({
    selector: 'add-edit-campaign-media',
    standalone: true,
    imports: [...sharedImports],
    templateUrl: './add-edit-campaign-media.component.html',
    styleUrl: './add-edit-campaign-media.component.scss'
})
export class AddEditCampaignMediaComponent
    extends AppComponent
    implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    @Output() onSave = new EventEmitter<void>();

    isShow = false;
    existingData: CampaignMedia | null = null;

    /* ================= FORM STATE ================= */
    campaignMedia: CampaignMediaForm = new CampaignMediaForm();

    screenOptions: DropdownItemScreen[] = [];
    mediaOptions: DropdownItemMedia[] = [];

    /* ================= MEDIA INFO STATE ================= */
    mediaInfoData: any[] = [];
    previewVisible = false;
    previewMedia: any = null;

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    /* ================= OPEN ================= */
    onShow(campaignId: number, data?: CampaignMedia): void {
        this.existingData = data ?? null;

        this.campaignMedia = new CampaignMediaForm();
        this.campaignMedia.campaignId = campaignId;
        this.campaignMedia.screenId = data?.screenId ?? 0;
        this.campaignMedia.mediaId = data?.mediaId ?? 0;
        this.campaignMedia.playDate = data?.playDate ? this.formatDate(data.playDate) : '';
        this.campaignMedia.startTime = data?.startTime ? this.formatTime(data.startTime) : '';
        this.campaignMedia.endTime = data?.endTime ? this.formatTime(data.endTime) : '';
        this.campaignMedia.duration = data?.duration ?? 0;
        this.campaignMedia.order = data?.order ?? 1;

        this.loadDropdowns(campaignId);
        this.loadMediaInfo(campaignId);
        this.isShow = true;
    }

    /* ================= DROPDOWNS ================= */
    private loadDropdowns(campaignId: number): void {
        forkJoin({
            screens: this.screenService.getScreenDdl(campaignId),
            media: this.mediaLibraryService.getMediaLibraryDdl(campaignId)
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: ({ screens, media }) => {
                this.screenOptions = screens?.data || [];
                this.mediaOptions = media?.data || [];
            },
            error: (err) => {
                this.showMessage('Error', err.message, 'error');
            }
        });
    }

    /* ================= MEDIA INFO ================= */
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
                    mediaName: x.mediaName ?? x.name ?? x.fileName ?? ''
                }));
                    this.sortMediaInfo();
                },
                error: (err) => {
                    this.showMessage('Error', err.error?.message || err.message, 'error');
                }
            });
    }

onPlayOrderChange(row: any, event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();

    if (!row.playOrder || row.playOrder < 1) return;

    const request: any = {
        campaignId: row.campaignId ?? this.campaignMedia.campaignId,
        screenId: row.screenId,
        playDate: this.formatDate(row.playDate),
        updatedBy: 1,                    // ← was createdBy, SP needs updatedBy
        media: [
            {
                mediaId: row.mediaId,
                playOrder: row.playOrder  // ← no url/mediaName needed
            }
        ]
    };

    this.campaignMediaService.updatecampaignMedia(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: () => {
                this.showMessage('Success', 'Play order updated', 'success');
                this.sortMediaInfo();
            },
            error: (err) => {
                this.showMessage('Error', err.error?.message || err.message, 'error');
            }
        });
}
    deleteMediaRow(row: any): void {
        if (!confirm('Are you sure you want to delete this item?')) return;

        this.campaignMediaService
            .deleteCampaignMedia(row.mediaId, 1)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage('Success', 'Deleted successfully', 'success');
                    this.mediaInfoData = this.mediaInfoData.filter(x => x.mediaId !== row.mediaId);
                },
                error: (err) => {
                    this.showMessage('Error', err.error?.message || err.message, 'error');
                }
            });
    }

    private sortMediaInfo(): void {
        this.mediaInfoData.sort((a, b) => (a.playOrder ?? 0) - (b.playOrder ?? 0));
    }

    /* ================= FORM HELPERS ================= */
    private formatDate(date: string): string {
    return date?.substring(0, 10) ?? '';
}

    private formatTime(time: string): string {
        return time?.substring(0, 5) || '';
    }

    private validateBasic(): boolean {
        const f = this.campaignMedia;
        if (!f.screenId) return this.warn('Select screen');
        if (!f.mediaId) return this.warn('Select media');
        if (!f.playDate) return this.warn('Select play date');
        if (!f.startTime) return this.warn('Select start time');
        if (!f.endTime) return this.warn('Select end time');
        return true;
    }

    private warn(msg: string): false {
        this.showMessage('Validation', msg, 'warn');
        return false;
    }

    /* ================= SUBMIT ================= */
    onSubmit(): void {
        if (!this.validateBasic()) return;

        const f = this.campaignMedia;
        const request: CampaignMediaRequest = {
            campaignId: f.campaignId,
            screenId: f.screenId,
            playDate: f.playDate,
            createdBy: 1,
            media: [{ mediaId: f.mediaId, playOrder: f.order ?? 1 }]
        };

        this.existingData
            ? this.updateCampaignMedia(request)
            : this.createCampaignMedia(request);
    }

    private createCampaignMedia(request: CampaignMediaRequest): void {
        this.campaignMediaService.addCampaignMedia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => this.success('Created successfully'),
                error: (err) => this.fail(err)
            });
    }

    private updateCampaignMedia(request: CampaignMediaRequest): void {
        this.campaignMediaService.updatecampaignMedia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => this.success('Updated successfully'),
                error: (err) => this.fail(err)
            });
    }

    private success(msg: string): void {
        this.showMessage('Success', msg, 'success');
        this.closeDialog();
        this.onSave.emit();
    }

    private fail(err: any): void {
        this.showMessage('Error', err.error?.message || err.message, 'error');
    }

    /* ================= CLOSE ================= */
    onCancel(): void {
        this.closeDialog();
    }

    private closeDialog(): void {
        this.isShow = false;
        this.existingData = null;
        this.campaignMedia = new CampaignMediaForm();
        this.screenOptions = [];
        this.mediaOptions = [];
        this.mediaInfoData = [];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}