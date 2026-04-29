import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScreenFilter, Screens } from '../model/Screen';
import { ApiResponse } from '../../media/model/MediaLibrary';

@Injectable({ providedIn: 'root' })
export class ScreenService {

  private apiUrl = 'https://localhost:7236/api/Screen';

  constructor(private http: HttpClient) {}

  getAll(filter: ScreenFilter): Observable<ApiResponse<Screens[]>> {
    const params = new HttpParams()
      .set('Search', filter.search ?? '')
      .set('Status', filter.status?.toString() ?? '');

    return this.http.get<ApiResponse<Screens[]>>(this.apiUrl, { params });
  }
  
  add(screens: any): Observable<ApiResponse<Screens>> {
    return this.http.post<ApiResponse<Screens>>(this.apiUrl, screens);
  }

  update(screens: any): Observable<ApiResponse<Screens>> {
    return this.http.put<ApiResponse<Screens>>(this.apiUrl, screens);
  }

  delete(id: number): Observable<ApiResponse<Screens>>{
    return this.http.delete<ApiResponse<Screens>>(`${this.apiUrl}/${id}`);
}
}