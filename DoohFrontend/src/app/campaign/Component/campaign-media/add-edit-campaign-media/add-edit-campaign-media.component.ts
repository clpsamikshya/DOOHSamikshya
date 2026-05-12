import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { sharedImports } from '../../../../shared/sharedImports';
import { AppComponent } from '../../../../app.component';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import {
    CampaignMedia,
    CampaignMediaRequest,
} from '../../../Model/CampaignMedia';
import { DropdownItemScreen } from '../../../../screens/model/Screen';
import { DropdownItemMedia } from '../../../../media/model/MediaLibrary';

@Component({
    selector: 'add-edit-campaign-media',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './add-edit-campaign-media.component.html',
    styleUrl: './add-edit-campaign-media.component.scss',
})
export class AddEditCampaignMediaComponent
    extends AppComponent
    implements OnInit, OnDestroy
{
    private readonly destory$ = new Subject<void>();

    @Output() onSave = new EventEmitter<void>();

    isShow = false;
    existingData: CampaignMedia | null = null;

    campaignMedia: CampaignMediaRequest = {
        campaignId: 0,
        screenId: 0,
        mediaId: 0,
        playDate: '',
        startTime: '',
        endTime: '',
        duration: 0,
        order: 1,
    };

    screenOptions: DropdownItemScreen[] = [];
    mediaOptions: DropdownItemMedia[] = [];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {}

    onShow(campaignId: number, data?: CampaignMedia): void {
        this.existingData = data ?? null;
        this.campaignMedia = {
            campaignId: campaignId,
            screenId: data?.screenId ?? 0,
            mediaId: data?.mediaId ?? 0,
            playDate: data?.playDate
                ? this.formatDateForInput(data.playDate)
                : '',
            startTime: data?.startTime
                ? this.formatTimeForInput(data.startTime)
                : '',
            endTime: data?.endTime ? this.formatTimeForInput(data.endTime) : '',
            duration: data?.duration ?? 0,
            order: data?.order ?? 1,
            createdBy: this.existingData ? undefined : 1,
            updatedBy: this.existingData ? 1 : undefined,
        };
        this.loadDropdowns(campaignId);
        this.isShow = true;
    }

    private loadDropdowns(campaignId: number): void {
        forkJoin({
            screens: this.screenService.getScreenDdl(campaignId),
            media: this.mediaLibraryService.getMediaLibraryDdl(campaignId),
        })
            .pipe(takeUntil(this.destory$))
            .subscribe({
                next: ({ screens, media }) => {
                    console.log('Screens:', screens);
                    console.log('Media:', media);
                    if (screens.success) {
                        this.screenOptions = screens.data || [];
                    }
                    if (media.success) {
                        this.mediaOptions = media.data || [];
                    }
                },
                error: (err) => {
                    this.showMessage('Error', err.message, 'error');
                },
            });
    }

    private formatDateForInput(dateString: string): string {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    private formatTimeForInput(timeString: string): string {
        return timeString.substring(0, 5);
    }
    private formatTimeDatabase(timeString: string): string {
        return timeString + ':00';
    }

    private validateCampaignMedia(): boolean {
        const { screenId, mediaId, playDate, startTime, endTime } =
            this.campaignMedia;
        if (!screenId || screenId === 0) {
            this.showMessage(
                'Validation Error',
                'Please select a screen.',
                'warn',
            );
            return false;
        }
        if (!mediaId || mediaId === 0) {
            this.showMessage(
                'Validation Error',
                'Please select media.',
                'warn',
            );
            return false;
        }
        if (!playDate.trim()) {
            this.showMessage(
                'Validation Error',
                'Please select a play date.',
                'warn',
            );
            return false;
        }
        if (!startTime.trim()) {
            this.showMessage(
                'Validation Error',
                'Please select a start time.',
                'warn',
            );
            return false;
        }
        if (!endTime.trim()) {
            this.showMessage(
                'Validation Error',
                'Please select an end time.',
                'warn',
            );
            return false;
        }
        return true;
    }
    onSubmit(): void {
        if (!this.validateCampaignMedia()) {
            return;
        }

        const request: CampaignMediaRequest = {
            ...this.campaignMedia,
            startTime: this.formatTimeDatabase(this.campaignMedia.startTime),
            endTime: this.formatTimeDatabase(this.campaignMedia.endTime),
        };

        this.existingData
            ? this.updateCampaignMedia(request)
            : this.createCampaignMedia(request);
    }

    private createCampaignMedia(request: CampaignMediaRequest): void {
        this.campaignMediaService
            .addCampaignMedia(request)
            .pipe(takeUntil(this.destory$))
            .subscribe({
                next: (response: any) => {
                    this.showMessage(
                        'Success',
                        'Campaign media added successfully.',
                        'success',
                    );
                    this.closeDialog();
                    if (response?.data?.data?.[0]) {
                        this.onSave.emit(response.data.data[0]);
                    }
                },
                error: (error: any) => {
                    this.showMessage('Error', error.message, 'error');
                },
            });
    }

    private updateCampaignMedia(request: CampaignMediaRequest): void {
        this.campaignMediaService
            .updatecampaignMedia(request)
            .pipe(takeUntil(this.destory$))
            .subscribe({
                next: (response: any) => {
                    this.showMessage(
                        'Success',
                        'Campaign media updated successfully.',
                        'success',
                    );
                    this.closeDialog();
                    if (response?.data?.data?.[0]) {
                        this.onSave.emit(response.data.data[0]);
                    }
                },
                error: (error: any) => {
                    this.showMessage('Error', error.message, 'error');
                },
            });
    }

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
            order: 1,
        };
        this.screenOptions = [];
        this.mediaOptions = [];
    }

    ngOnDestroy(): void {
        this.destory$.next();
        this.destory$.complete();
    }
}
