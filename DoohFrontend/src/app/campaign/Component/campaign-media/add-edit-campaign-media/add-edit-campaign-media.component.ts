import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { Subject, forkJoin, takeUntil } from 'rxjs';

import {
    CampaignMedia,
    CampaignMediaForm
} from '../../../Model/CampaignMedia';

import { DropdownItemScreen } from '../../../../screens/model/Screen';
import { DropdownItemMedia } from '../../../../media/model/MediaLibrary';

import { AppComponent } from '../../../../app.component';
import { sharedImports } from '../../../../shared/sharedImports';

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

    @Output() onSave = new EventEmitter<any>();

    private destroy$ = new Subject<void>();

    isShow = false;
    existingData: CampaignMedia | null = null;

    campaignMedia: CampaignMediaForm = new CampaignMediaForm();

    screenOptions: DropdownItemScreen[] = [];
    mediaOptions: DropdownItemMedia[] = [];
    mediaInfoData: any[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    /* ================= OPEN ================= */
    onShow(campaignId: number, data?: CampaignMedia) {
        this.existingData = data || null;

        this.initializeForm(campaignId);
        this.loadDropdowns(campaignId);
        this.loadMediaInfo(campaignId);

        this.isShow = true;
    }

    initializeForm(campaignId: number) {
        this.campaignMedia = {
            campaignId,
            screenId: this.existingData?.screenId || 0,
            mediaId: this.existingData?.mediaId || 0,
            playDate: this.existingData?.playDate?.substring(0, 10) || '',
            startTime: this.existingData?.startTime?.substring(0, 5) || '',
            endTime: this.existingData?.endTime?.substring(0, 5) || '',
            duration: this.existingData?.duration || 0,
            order: this.existingData?.order || 1
        } as CampaignMediaForm;
    }

    /* ================= REQUEST BUILDER ================= */
    private buildRequest() {
        const f = this.campaignMedia;

        return {
            campaignId: f.campaignId,
            screenId: f.screenId,
            playDate: f.playDate,
            createdBy: 1,
            media: [
                {
                    mediaId: f.mediaId,
                    playOrder: f.order ?? 1
                }
            ]
        };
    }

    /* ================= DROPDOWNS ================= */
    loadDropdowns(campaignId: number) {
        forkJoin({
            screens: this.screenService.getScreenDdl(campaignId),
            media: this.mediaLibraryService.getMediaLibraryDdl(campaignId)
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res) => {
                this.screenOptions = res?.screens?.data ?? [];
                this.mediaOptions = res?.media?.data ?? [];
            },
            error: (err) => {
                this.showMessage('Error', err.message, 'error');
            }
        });
    }

    /* ================= MEDIA LIST ================= */
    loadMediaInfo(campaignId: number) {
        this.campaignMediaService.getCampaignMedia({ campaignId })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    const raw = Array.isArray(res)
                        ? res
                        : res?.data?.data || res?.data || [];

                    this.mediaInfoData = raw.map((x: any) => ({
                        ...x,
                        playOrder: x?.playOrder ?? x?.PlayOrder ?? 0,
                        url: x?.url ?? x?.mediaUrl ?? x?.filePath ?? '',
                        mediaName: x?.mediaName ?? x?.name ?? x?.fileName ?? ''
                    }));

                    this.sortMedia();
                },
                error: (err) => {
                    this.showMessage('Error', err.message, 'error');
                }
            });
    }

    private sortMedia() {
        this.mediaInfoData.sort((a, b) =>
            (a.playOrder ?? 0) - (b.playOrder ?? 0)
        );
    }

    /* ================= PLAY ORDER ================= */
    onPlayOrderChange(row: any, event?: Event) {
        event?.stopPropagation();

        if (!row?.playOrder || row.playOrder < 1) return;

        const request = {
            campaignId: row?.campaignId ?? this.campaignMedia.campaignId,
            screenId: row?.screenId,
            playDate: row?.playDate?.substring(0, 10) ?? '',
            updatedBy: 1,
            media: [
                {
                    mediaId: row?.mediaId,
                    playOrder: row.playOrder
                }
            ]
        };

        this.campaignMediaService.updatecampaignMedia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage('Success', 'Updated successfully', 'success');
                    this.sortMedia();
                },
                error: (err) => {
                    this.showMessage('Error', err.message, 'error');
                }
            });
    }

    /* ================= DELETE ================= */
    deleteMediaRow(row: any) {
        if (!row?.mediaId) return;
        if (!confirm('Are you sure?')) return;

        this.campaignMediaService.deleteCampaignMedia(row.mediaId, 1)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.mediaInfoData =
                        this.mediaInfoData.filter(x => x.mediaId !== row.mediaId);

                    this.showMessage('Success', 'Deleted successfully', 'success');
                },
                error: (err) => {
                    this.showMessage('Error', err.message, 'error');
                }
            });
    }

    /* ================= SUBMIT (PRODUCT STYLE) ================= */
    onSubmit() {

        if (!this.campaignMedia.screenId) {
            alert('Screen is required');
            return;
        }

        if (!this.campaignMedia.mediaId) {
            alert('Media is required');
            return;
        }

        if (!this.campaignMedia.playDate) {
            alert('Play date is required');
            return;
        }

        const request = this.buildRequest();

        const call = this.existingData
            ? this.campaignMediaService.updatecampaignMedia(request)
            : this.campaignMediaService.addCampaignMedia(request);

        call.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: any) => {
                this.showMessage(
                    'Success',
                    this.existingData ? 'Updated successfully' : 'Added successfully',
                    'success'
                );

                this.onCancel();
                this.onSave.emit(res?.data ?? request);
            },
            error: (err) => {
                this.showMessage('Error', err.message, 'error');
            }
        });
    }

    /* ================= CLOSE ================= */
    onCancel() {
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