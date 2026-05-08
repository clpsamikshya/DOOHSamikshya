import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ScreenFilter, ScreenResponse, Screens } from '../model/Screen';
import { ApiResponse } from '../../media/model/MediaLibrary';

@Injectable({ providedIn: 'root' })
export class ScreenService {

    private apiUrl = 'https://localhost:7236/api/Screen';

    constructor(private http: HttpClient) {}

    private handleError(err: any): Observable<never> {
        const message = err.error?.message
                     ?? err.error?.title
                     ?? err.message
                     ?? 'An unexpected error occurred';
        return throwError(() => new Error(message));
    }

    getAll(filter: ScreenFilter): Observable<ApiResponse<ScreenResponse>> {
        let params = new HttpParams()
            .set('search',   filter.search   ?? '')
            .set('offset',   filter.offset   ?? 0)
            .set('pageSize', filter.pageSize ?? 10);

        if (filter.status !== undefined && filter.status !== null)
            params = params.set('status', filter.status.toString());

        if (filter.orientation !== undefined && filter.orientation !== null)
            params = params.set('orientation', filter.orientation.toString());

        return this.http.get<ApiResponse<ScreenResponse>>(this.apiUrl, { params })
            .pipe(catchError(this.handleError));
    }

    add(screens: any): Observable<ApiResponse<Screens>> {
        return this.http.post<ApiResponse<Screens>>(this.apiUrl, screens)
            .pipe(catchError(this.handleError));
    }

    update(screens: any): Observable<ApiResponse<Screens>> {
        return this.http.put<ApiResponse<Screens>>(this.apiUrl, screens)
            .pipe(catchError(this.handleError));
    }

    delete(id: number): Observable<ApiResponse<Screens>> {
        return this.http.delete<ApiResponse<Screens>>(`${this.apiUrl}/${id}?cascadeDelete=true`)
            .pipe(catchError(this.handleError));
    }

    deleteOperatingHour(id: number, screenId: number): Observable<ApiResponse<Screens>> {
        return this.http.delete<ApiResponse<Screens>>(
            `${this.apiUrl}/operating-hour/${id}?screenId=${screenId}`
        ).pipe(catchError(this.handleError));
    }
}