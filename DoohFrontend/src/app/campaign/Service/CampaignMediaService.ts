import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {
    ApiResponse,
    CampaignMedia,
    CampaignMediaFilter,
    CampaignMediaRequest,
    CampaignMediaResponse,
} from '../Model/CampaignMedia';

@Injectable({ providedIn: 'root' })
export class CampaignMediaService {
    private apiUrl = 'https://localhost:7236/api/CampaignMedia';

    constructor(private http: HttpClient) {}

    private handleError(err: any): Observable<never> {
        const message =
            err.error?.message ??
            err.error?.title ??
            err.message ??
            'An unexpected error occurred';
        return throwError(() => new Error(message));
    }

   getCampaignMedia(
    filter: CampaignMediaFilter,
): Observable<ApiResponse<CampaignMedia[]>> {

    let params = new HttpParams()
        .set('offset', filter.offset ?? 0)
        .set('pageSize', filter.pageSize ?? 10);

    if (filter.campaignId != null) {
        params = params.set('campaignId', filter.campaignId);
    }

    if (filter.screenId != null) {
        params = params.set('screenId', filter.screenId);
    }

    if (filter.playDate) {
        params = params.set('playDate', filter.playDate);
    }

    return this.http
        .get<ApiResponse<CampaignMedia[]>>(this.apiUrl, { params })
        .pipe(catchError(this.handleError));
}

    addCampaignMedia(
        request: CampaignMediaRequest,
    ): Observable<ApiResponse<CampaignMediaResponse>> {
        return this.http
            .post<ApiResponse<CampaignMediaResponse>>(this.apiUrl, request)
            .pipe(catchError(this.handleError));
    }

    updatecampaignMedia(
        request: CampaignMediaRequest,
    ): Observable<ApiResponse<CampaignMediaResponse>> {
        return this.http
            .put<ApiResponse<CampaignMediaResponse>>(`${this.apiUrl}`, request)
            .pipe(catchError(this.handleError));
    }

//     updatecampaignMedia(
//     request: CampaignMediaRequest,
// ): Observable<ApiResponse<CampaignMediaResponse>> {
//     const payload = { request: request };  // Wrap it here
//     return this.http
//         .put<ApiResponse<CampaignMediaResponse>>(`${this.apiUrl}`, payload)
//         .pipe(catchError(this.handleError));
// }

// addCampaignMedia(
//     request: CampaignMediaRequest,
// ): Observable<ApiResponse<CampaignMediaResponse>> {
//     const payload = { request: request };  // Wrap it here too
//     return this.http
//         .post<ApiResponse<CampaignMediaResponse>>(this.apiUrl, payload)
//         .pipe(catchError(this.handleError));
// }

    deleteCampaignMedia(id: number, deletedBy: number): Observable<ApiResponse<CampaignMedia>> {
        let params = new HttpParams().set('deletedBy', deletedBy);
        return this.http
            .delete<ApiResponse<CampaignMedia>>(`${this.apiUrl}/${id}`, { params })
            .pipe(catchError(this.handleError));
     }
}
