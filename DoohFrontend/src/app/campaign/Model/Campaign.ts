

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: any;
}

export interface CampaignFilter {
    search?: string;
    status?: number | null;
    campaignId?: number | null;
    offset?: number;
    pageSize?: number;
}

export class CampaignDate {
    id: number;
    campaignId: number;
    startDateTime: Date | null;
    endDateTime: Date | null;

    constructor() {
        this.id = 0;
        this.campaignId = 0;
        this.startDateTime = null;
        this.endDateTime = null;
    }
}

export class CampaignScreen {
    id: number;
    campaignId: number;
    screenId: number;
    screenName: string;
    isDeleted?: boolean;

    constructor() {
        this.id = 0;
        this.campaignId = 0;
        this.screenId = 0;
        this.screenName = '';
        this.isDeleted = false;
    }
}

export class Campaign {
    id: number;
    tenantId: number;

    name: string;
    status: number;
    durationInDays: number;
    remarks: string;

    createdAt?: string;
    updatedAt?: string;

    createdBy: number;
    updatedBy: number;

    deletedAt?: string | null;
    deletedBy?: number | null;

    dateRanges: CampaignDate[];
    screen: CampaignScreen[];

    // SP response model
    campaignMedia: CampaignMediaGroup[];

    screenIds: number[];

    constructor() {
        this.id = 0;
        this.tenantId = 0;

        this.name = '';
        this.status = 1;
        this.durationInDays = 0;
        this.remarks = '';

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();

        this.createdBy = 1;
        this.updatedBy = 1;

        this.deletedAt = null;
        this.deletedBy = null;

        this.dateRanges = [];
        this.screen = [];

        this.campaignMedia = [];

        this.screenIds = [];
    }
}

export interface CampaignResponse {
    totalRows: number;
    data: Campaign[];
}

export class CampaignInsert {
    tenantId: number = 1;

    name: string = '';
    status: number = 1;
    remarks: string = '';

    createdBy: number = 1;

    date: { startDateTime: string; endDateTime: string }[] = [];

    screen: { screenId: number }[] = [];

    constructor() {
        this.tenantId = 0;

        this.name = '';
        this.status = 1;
        this.remarks = '';

        this.createdBy = 1;

        this.date = [];
        this.screen = [];
    }
}

export class CampaignUpdate {
    id: number;

    name: string;
    status: number;
    remarks: string;

    updatedBy: number;

    dateRanges: CampaignDate[];
    screenIds: number[];

    constructor() {
        this.id = 0;

        this.name = '';
        this.status = 1;
        this.remarks = '';

        this.updatedBy = 1;

        this.dateRanges = [];
        this.screenIds = [];
    }
}

export class CampaignMediaItem {
    id: number;
    mediaId: number;

    mediaName: string;
    mediaType: boolean;
    Url:  string;
    playOrder: number;

    createdAt?: string;
    createdBy?: number;

    constructor() {
        this.id = 0;
        this.mediaId = 0;

        this.mediaName = '';
        this.mediaType = false;
         this.Url = '';
        this.playOrder = 1;

        this.createdAt = '';
        this.createdBy = 0;
    }
}

export class CampaignMediaGroup {
    screenId: number;
    screenName: string;

    playDate: string;

    createdAt?: string;
    createdBy?: number;

    media: CampaignMediaItem[];

    constructor() {
        this.screenId = 0;
        this.screenName = '';

        this.playDate = '';

        this.createdAt = '';
        this.createdBy = 0;

        this.media = [];
    }
}