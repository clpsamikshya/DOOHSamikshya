// campaign.model.ts

export interface CampaignFilter {
    search?: string;
    status?: number | null;
    campaignId?: number | null;
    offset?: number;
    pageSize?: number;
}

export interface CampaignDate {
    id: number;
    campaignId: number;
    startDateTime: string;
    endDateTime: string;
}

export interface CampaignScreen {
    id: number;
    campaignId: number;
    screenId: number;
    screenName: string;
}

export interface Campaign {
    id: number;
    tenantId: number;
    name: string;
    status: number;
    durationInDays: number;
    remarks: string;
    createdAt: string;
    createdBy: number;

    date: CampaignDate[];
    screen: CampaignScreen[];
}

export interface CampaignResponse {
    totalRows: number;
    data: Campaign[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: any;
}