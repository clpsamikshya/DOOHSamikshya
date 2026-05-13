import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { sharedImports } from '../../../../shared/sharedImports';
import { AppComponent } from '../../../../app.component';

@Component({
  selector: 'campaign-media-info',
  standalone: true,
  imports: [...sharedImports],
  templateUrl: './campaign-media-info.component.html',
  styleUrl: './campaign-media-info.component.scss'
})
export class CampaignMediaInfoComponent extends AppComponent implements OnChanges, OnDestroy {

  @Input() campaignId!: number;
  @Input() showPreview: boolean = false; // 🔥 NEW: Control preview feature

  data: any[] = [];

  previewVisible = false;
  previewMedia: any = null;

  private destroy$ = new Subject<void>();

  constructor(injector: Injector) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campaignId'] && this.campaignId > 0) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.campaignMediaService
      .getCampaignMedia({ campaignId: this.campaignId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const raw = res?.data?.data || [];

          if (raw.length === 0) {
            this.data = [];
            return;
          }

          if (this.showPreview) {
            const mediaIds: number[] = Array.from(
              new Set(raw.map((x: any) => Number(x.mediaId)))
            );
            this.loadMediaDetails(mediaIds, raw);
          } else {
            this.data = raw.map((x: any) => ({
              ...x,
              playOrder: x.playOrder ?? x.PlayOrder ?? 0,
              mediaUrl: ''
            }));
            this.sortData();
          }
        },
        error: (err) => {
          this.showMessage('Error', err.error?.message || err.message, 'error');
        }
      });
  }

  private loadMediaDetails(mediaIds: number[], campaignData: any[]): void {
    const mediaRequests = mediaIds.map(id =>
      this.mediaLibraryService.getMediaById(id)
    );

    forkJoin(mediaRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responses: any[]) => {
          const mediaMap = new Map<number, string>();

          responses.forEach((response: any) => {
            const media = response?.data;
            if (media) {
              mediaMap.set(media.id, media.url);
            }
          });

          this.data = campaignData.map((x: any) => ({
            ...x,
            playOrder: x.playOrder ?? x.PlayOrder ?? 0,
            mediaUrl: mediaMap.get(x.mediaId) || ''
          }));

          this.sortData();
        },
        error: (err) => {
          this.showMessage('Error', err.error?.message || err.message, 'error');
        }
      });
  }

  openPreview(row: any): void {
    if (!this.showPreview) return;
    
    this.previewMedia = row;
    this.previewVisible = true;
  }

  closePreview(): void {
    const videoEl = document.querySelector('p-dialog video') as HTMLVideoElement;

    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }

    this.previewVisible = false;
    this.previewMedia = null;
  }

  isImage(url: string): boolean {
    if (!this.showPreview) return false; 
    return !!url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isVideo(url: string): boolean {
    if (!this.showPreview) return false; 
    return !!url && /\.(mp4|webm|ogg)$/i.test(url);
  }

  onPlayOrderChange(row: any): void {
    const request: any = {
      campaignId: this.campaignId,
      screenId: row.screenId ?? 0,
      playDate: row.playDate ?? '',
      media: [
        {
          mediaId: row.mediaId,
          playOrder: row.playOrder
        }
      ]
    };

    this.campaignMediaService.updatecampaignMedia(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage('Success', 'Play order updated', 'success');
          this.sortData();
        },
        error: (err) => {
          this.showMessage('Error', err.error?.message || err.message, 'error');
        }
      });
  }

  deleteRow(row: any): void {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const deletedBy = 1;

    this.campaignMediaService
      .deleteCampaignMedia(row.mediaId, deletedBy)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage('Success', 'Deleted successfully', 'success');
          this.data = this.data.filter(x => x.mediaId !== row.mediaId);
        },
        error: (err) => {
          this.showMessage('Error', err.error?.message || err.message, 'error');
        }
      });
  }

  private sortData(): void {
    this.data.sort((a: any, b: any) => (a.playOrder ?? 0) - (b.playOrder ?? 0));
  }
}