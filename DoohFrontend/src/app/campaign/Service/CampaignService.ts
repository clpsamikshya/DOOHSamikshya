// campaign.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse, Campaign, CampaignFilter, CampaignResponse } from '../Model/Campaign';


@Injectable({
    providedIn: 'root'
})
export class CampaignService {

    private api = 'https://localhost:7236/api/CampaignContoller';

    constructor(private http: HttpClient) {}

    private handleError(err: any): Observable<never> {

        const message =
            err.error?.message ??
            err.error?.title ??
            err.message ??
            'An unexpected error occurred';

        return throwError(() => new Error(message));
    }

    getCampaigns(
        filter: CampaignFilter
    ): Observable<ApiResponse<CampaignResponse>> {

        let params = new HttpParams()
            .set('search', filter.search ?? '')
            .set('offset', filter.offset ?? 0)
            .set('pageSize', filter.pageSize ?? 10);

        if (filter.status !== null && filter.status !== undefined) {
            params = params.set('status', filter.status);
        }

        if (filter.campaignId !== null && filter.campaignId !== undefined) {
            params = params.set('campaignId', filter.campaignId);
        }

        return this.http
            .get<ApiResponse<CampaignResponse>>(
                this.api,
                { params }
            )
            .pipe(catchError(this.handleError));
    }

    deleteCampaign(
        id: number
    ): Observable<ApiResponse<Campaign>> {

        return this.http
            .delete<ApiResponse<Campaign>>(
                `${this.api}/${id}`
            )
            .pipe(catchError(this.handleError));
    }
}