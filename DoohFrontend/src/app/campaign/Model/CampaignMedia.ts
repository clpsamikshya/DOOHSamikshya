export interface CampaignMedia {
    id: number;
    campaignId: number;
    screenId: number;
    mediaId: number;
    playDate: string;
    startTime: string;
    endTime: string;
    duration: number;
    order: number;
    isDeleted: boolean;
    createdAt: string;
    createdBy: number;
    updatedAt?: string;
    updatedBy?: number;
    deletedAt?: string;
    deletedBy?: number;
}

export interface CampaignMediaRequest {
    campaignId: number;
    screenId: number;
    mediaId: number;
    playDate: string;
    startTime: string;
    endTime: string;
    duration?: number;
    order?: number;
    createdBy?: number;
    updatedBy?: number;
}

export interface CampaignMediaResponse {
    success: boolean;
    message: string;
    data: CampaignMedia[];
}

export interface CampaignMediaFilter {
    campaignId?: number;
    screenId?: number;
    playDate?: string;
    offset?: number;
    pageSize?: number;
}

export interface CampaignMediaList {
    items: CampaignMedia[];
    totalCount: number;
    offset: number;
    pageSize: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T;
    errors?: any;
}