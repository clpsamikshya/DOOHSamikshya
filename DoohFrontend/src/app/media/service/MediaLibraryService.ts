import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, MediaFilter, MediaLibrary, MediaLibraryResponse } from '../model/MediaLibrary';

@Injectable({ providedIn: 'root' })
export class MediaLibraryService {
  private api = 'https://localhost:7236/api/MediaLibrary';

  constructor(private http: HttpClient) {}

getMediaLibrary(filter: MediaFilter): Observable<ApiResponse<MediaLibraryResponse>> {
  let params = new HttpParams()
    .set('search', filter.search ?? '')
    .set('offset', filter.offset ?? 0)
    .set('pageSize', filter.pageSize ?? 10);

  if (filter.isVideo !== undefined) {
    params = params.set('isVideo', String(filter.isVideo));
  }

  if (filter.deleteMode === 'deleted') {
    params = params.set('deletedOnly', 'true');
  } else if (filter.deleteMode === 'include') {
    params = params.set('includeDeleted', 'true');
  }

  return this.http.get<ApiResponse<MediaLibraryResponse>>(this.api, { params });
}


  uploadMedia(file: File): Observable<ApiResponse<MediaLibrary[]>> {
    const formData = new FormData();
    formData.append('File', file, file.name);
    return this.http.post<ApiResponse<MediaLibrary[]>>(`${this.api}/upload`, formData);
  }

  deleteMedia(id: number): Observable<ApiResponse<MediaLibrary>> {
    return this.http.delete<ApiResponse<MediaLibrary>>(`${this.api}/${id}`);
  }
}