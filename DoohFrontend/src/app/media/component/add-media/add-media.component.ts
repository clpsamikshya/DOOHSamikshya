import { Component, EventEmitter, Injector, OnDestroy, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';

@Component({
    selector: 'add-media',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './add-media.component.html',
    styleUrl: './add-media.component.scss'
})
export class AddMediaComponent extends AppComponent implements OnDestroy {
    private readonly destroy$ = new Subject<void>();

    @Output() onSave = new EventEmitter<void>();

    visible = false;
    selectedFile: File | null = null;
    isUploading = false;
    previewUrl: string | null = null;

    constructor(injector: Injector) {
        super(injector);
    }

    onShow(): void {
        this.visible = true;
        this.selectedFile = null;
        this.previewUrl = null;
    }

    onHide(): void {
        this.visible = false;
        this.selectedFile = null;
        this.previewUrl = null;
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (!file) return;
        this.selectedFile = file;

        // generate local preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    isVideo(): boolean {
        return this.selectedFile?.type.startsWith('video/') ?? false;
    }

    onUpload(): void {
        if (!this.selectedFile) return;
        this.isUploading = true;

        this.mediaLibraryService
            .uploadMedia(this.selectedFile)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isUploading = false;
                    this.showMessage('Success', 'Media uploaded successfully', 'success');
                    this.onSave.emit();
                    this.onHide();
                },
                error: (err: any) => {
                    this.isUploading = false;
                    this.showMessage('Error', err.message, 'error');
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}