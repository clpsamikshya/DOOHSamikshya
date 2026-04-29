import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, MediaLibrary } from '../model/MediaLibrary';

@Injectable({ providedIn: 'root' })
export class MediaLibraryService {
  private api = 'https://localhost:7236/api/MediaLibrary';

  constructor(private http: HttpClient) {}

  getMediaLibrary(): Observable<ApiResponse<MediaLibrary[]>> {
    return this.http.get<ApiResponse<MediaLibrary[]>>(this.api);
  }

  // Only sends file — backend extracts everything else
  uploadMedia(file: File): Observable<ApiResponse<MediaLibrary[]>> {
    const formData = new FormData();
    formData.append('File', file, file.name);
    return this.http.post<ApiResponse<MediaLibrary[]>>(`${this.api}/upload`, formData);
  }

  deleteMedia(id: number): Observable<ApiResponse<MediaLibrary>> {
    return this.http.delete<ApiResponse<MediaLibrary>>(`${this.api}/${id}`);
  }
}