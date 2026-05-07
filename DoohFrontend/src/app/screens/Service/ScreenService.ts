import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScreenFilter, ScreenResponse, Screens } from '../model/Screen';
import { ApiResponse } from '../../media/model/MediaLibrary';

@Injectable({ providedIn: 'root' })
export class ScreenService {

  private apiUrl = 'https://localhost:7236/api/Screen';

  constructor(private http: HttpClient) {}

  
getAll(filter: ScreenFilter): Observable<ApiResponse<ScreenResponse>> {
  let params = new HttpParams()
    .set('search', filter.search ?? '')
    .set('offset', filter.offset ?? 0)      // ✅ lowercase
    .set('pageSize', filter.pageSize ?? 10); // ✅ lowercase

  if (filter.status !== undefined && filter.status !== null) {
    params = params.set('status', filter.status.toString());
  }

  if (filter.orientation !== undefined && filter.orientation !== null) {
    params = params.set('orientation', filter.orientation.toString());
  }

  return this.http.get<ApiResponse<ScreenResponse>>(this.apiUrl, { params });
}


  
  add(screens: any): Observable<ApiResponse<Screens>> {
    return this.http.post<ApiResponse<Screens>>(this.apiUrl, screens);
  }

  update(screens: any): Observable<ApiResponse<Screens>> {
    return this.http.put<ApiResponse<Screens>>(this.apiUrl, screens);
  }

  delete(id: number): Observable<ApiResponse<Screens>>{
     const params = new HttpParams().set('ScreenId', id.toString());
    return this.http.delete<ApiResponse<Screens>>(`${this.apiUrl}/${id}`);
}

deleteOperatingHour(id: number, screenId: number): Observable<ApiResponse<Screens>> {
    return this.http.delete<ApiResponse<Screens>>(
        `${this.apiUrl}/operating-hour/${id}?screenId=${screenId}`
    );
}
}