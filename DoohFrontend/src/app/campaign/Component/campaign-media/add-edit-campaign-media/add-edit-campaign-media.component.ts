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
    CampaignMediaRequest
} from '../../../Model/CampaignMedia';

import { DropdownItemScreen } from '../../../../screens/model/Screen';
import { DropdownItemMedia } from '../../../../media/model/MediaLibrary';
import { CampaignMediaInfoComponent } from '../campaign-media-info/campaign-media-info.component';

/* ================= UI MODEL ================= */
interface CampaignMediaForm {
    campaignId: number;
    screenId: number;
    mediaId: number;
    playDate: string;
    startTime: string;
    endTime: string;
    duration: number;
    order: number;
}

@Component({
    selector: 'add-edit-campaign-media',
    standalone: true,
    imports: [...sharedImports, CampaignMediaInfoComponent],
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
    campaignMedia: CampaignMediaForm = {
        campaignId: 0,
        screenId: 0,
        mediaId: 0,
        playDate: '',
        startTime: '',
        endTime: '',
        duration: 0,
        order: 1
    };

    screenOptions: DropdownItemScreen[] = [];
    mediaOptions: DropdownItemMedia[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    /* ================= OPEN ================= */
    onShow(campaignId: number, data?: CampaignMedia): void {

        this.existingData = data ?? null;

        this.campaignMedia = {
            campaignId,
            screenId: data?.screenId ?? 0,
            mediaId: data?.mediaId ?? 0,
            playDate: data?.playDate ? this.formatDate(data.playDate) : '',
            startTime: data?.startTime ? this.formatTime(data.startTime) : '',
            endTime: data?.endTime ? this.formatTime(data.endTime) : '',
            duration: data?.duration ?? 0,
            order: data?.order ?? 1
        };

        this.loadDropdowns(campaignId);
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

    /* ================= FORMATTERS ================= */
    private formatDate(date: string): string {
        return new Date(date).toISOString().split('T')[0];
    }

    private formatTime(time: string): string {
        return time?.substring(0, 5) || '';
    }

    /* ================= VALIDATION ================= */
    private validateBasic(): boolean {

        if (!this.campaignMedia.screenId) {
            this.showMessage('Validation', 'Select screen', 'warn');
            return false;
        }

        if (!this.campaignMedia.mediaId) {
            this.showMessage('Validation', 'Select media', 'warn');
            return false;
        }

        if (!this.campaignMedia.playDate) {
            this.showMessage('Validation', 'Select play date', 'warn');
            return false;
        }

        if (!this.campaignMedia.startTime) {
            this.showMessage('Validation', 'Select start time', 'warn');
            return false;
        }

        if (!this.campaignMedia.endTime) {
            this.showMessage('Validation', 'Select end time', 'warn');
            return false;
        }

        return true;
    }

    /* ================= SUBMIT ================= */
    onSubmit(): void {

        if (!this.validateBasic()) return;

        const request: CampaignMediaRequest = {
            campaignId: this.campaignMedia.campaignId,
            screenId: this.campaignMedia.screenId,
            playDate: this.campaignMedia.playDate,
            createdBy: 1,

            media: [
                {
                    mediaId: this.campaignMedia.mediaId,
                    playOrder: this.campaignMedia.order ?? 1
                }
            ]
        };

        this.existingData
            ? this.updateCampaignMedia(request)
            : this.createCampaignMedia(request);
    }

    /* ================= API ================= */
    private createCampaignMedia(request: CampaignMediaRequest): void {
        this.campaignMediaService.addCampaignMedia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage('Success', 'Created successfully', 'success');
                    this.closeDialog();
                    this.onSave.emit();
                },
                error: (err) => {
                    this.showMessage('Error', err.error?.message || err.message, 'error');
                }
            });
    }

    private updateCampaignMedia(request: CampaignMediaRequest): void {
        this.campaignMediaService.updatecampaignMedia(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showMessage('Success', 'Updated successfully', 'success');
                    this.closeDialog();
                    this.onSave.emit();
                },
                error: (err) => {
                    this.showMessage('Error', err.error?.message || err.message, 'error');
                }
            });
    }

    /* ================= CLOSE ================= */
    onCancel(): void {
        this.closeDialog();
    }

    private closeDialog(): void {
        this.isShow = false;
        this.existingData = null;

        this.campaignMedia = {
            campaignId: 0,
            screenId: 0,
            mediaId: 0,
            playDate: '',
            startTime: '',
            endTime: '',
            duration: 0,
            order: 1
        };

        this.screenOptions = [];
        this.mediaOptions = [];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}