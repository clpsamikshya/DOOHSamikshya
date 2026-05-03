import {
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';
import { MediaFilter, MediaLibrary } from '../../model/MediaLibrary';
import { AddMediaComponent } from '../add-media/add-media.component';

@Component({
    selector: 'app-media-library',
    standalone: true,
    imports: [sharedImports, AddMediaComponent],
    templateUrl: './media-library.component.html',
    styleUrls: ['./media-library.component.scss'],
})
export class MediaLibraryComponent
    extends AppComponent
    implements OnInit, OnDestroy
{
    private readonly destroy$ = new Subject<void>();

    @ViewChild('addMedia') addMedia!: AddMediaComponent;

    mediaList: MediaLibrary[] = [];
    isLoading = false;
    previewVisible = false;
    previewMedia: MediaLibrary | null = null;

    filter: MediaFilter = {
        search: '',
        isVideo: undefined,
        //isDeleted: undefined
        isDeleted: undefined,
    };

    typeOptions = [
        { label: 'Active Only', value: false },
        { label: 'Include Deleted', value: true },
    ];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.loadMedia();
    }

    applyFilter(): void {
        this.loadMedia();
    }

    clearFilter(): void {
        this.filter = { search: '', isVideo: undefined, isDeleted: undefined };
        this.loadMedia();
    }

    loadMedia(): void {
        this.isLoading = true;
        this.mediaLibraryService
            .getMediaLibrary(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.mediaList = res.data ?? [];
                    this.isLoading = false;
                },
                error: (err: any) => {
                    this.isLoading = false;
                    this.showMessage('Error', err.message, 'error');
                },
            });
    }

    onDelete(media: MediaLibrary): void {
       this.confirmAction({
        message: 'Are you sure you want to delete this media?',
        header: 'Confirm Deletion',
        accept: () => {
            this.mediaLibraryService
                .deleteMedia(media.id) 
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.showMessage('Success', 'Media deleted successfully', 'success');
                        this.loadMedia();
                    },
                    error: (err: any) => {
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
