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
    totalRecords = 0;
    pageSize = 10;
    previewVisible = false;
    previewMedia: MediaLibrary | null = null;

    filter: MediaFilter = {
        search: '',
        isVideo: undefined,
        deleteMode: 'active',
        offset: 0,
        pageSize: 10
    };

    typeOptions = [
        { label: 'Active Only', value: 'active' },
        { label: 'Include Deleted', value: 'include' },
        { label: 'Deleted Only', value: 'deleted' },
    ];

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.loadMedia();
    }

    applyFilter(): void {
        this.filter = { ...this.filter, offset: 0 };
        this.loadMedia();
    }

    clearFilter(): void {
        this.filter = {
            search: '',
            isVideo: undefined,
            deleteMode: 'active',
            offset: 0,
            pageSize: this.pageSize
        };
        this.loadMedia();
    }

    onPageChange(event: any): void {
        this.filter = {
            ...this.filter,
            offset: event.first,
            pageSize: event.rows
        };
        this.loadMedia();
    }

    loadMedia(): void {
        this.isLoading = true;
        this.mediaLibraryService
            .getMediaLibrary(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.mediaList    = res.data?.data      ?? [];
                    this.totalRecords = res.data?.totalRows ?? 0;
                    this.isLoading    = false;
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