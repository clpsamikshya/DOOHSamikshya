import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';
import { MediaLibrary } from '../../model/MediaLibrary';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [sharedImports],
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.scss']
})
export class MediaLibraryComponent extends AppComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  mediaList: MediaLibrary[] = [];
  selectedFile: File | null = null;
  isUploading = false;
  isLoading = false;

  previewVisible = false;
  previewMedia: MediaLibrary | null = null;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.isLoading = true;
    this.mediaLibraryService
      .getMediaLibrary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.mediaList = res.data ?? [];
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.showMessage('Error', err.message, 'error');
        }
      });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    this.isUploading = true;

    this.mediaLibraryService
      .uploadMedia(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.isUploading = false;
          this.loadMedia();
        },
        error: (err) => {
          this.isUploading = false;
          this.showMessage('Error', err.message, 'error');
        }
      });
  }

  onDelete(id: number): void {
    this.confirmAction({
      message: 'Are you sure you want to delete this media?',
      header: 'Confirm Deletion',
      accept: () => {
        this.mediaLibraryService
          .deleteMedia(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              console.log('Delete response:', res);
              this.showMessage('Success', 'Media deleted successfully', 'success');
              this.loadMedia();
            },
            error: (err) => {
              this.showMessage('Error', err.message, 'error');
            }
          });
      },
      reject: () => this.showMessage('Info', 'Deletion cancelled', 'info')
    });
  }

  openPreview(media: MediaLibrary): void {
    this.previewMedia = media;
    this.previewVisible = true;
  }

  closePreview(): void {
    this.previewVisible = false;
    this.previewMedia = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}