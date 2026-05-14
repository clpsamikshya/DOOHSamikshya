export class CampaignMedia {
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

  constructor() {
    this.id = 0;
    this.campaignId = 0;
    this.screenId = 0;
    this.mediaId = 0;

    this.playDate = '';
    this.startTime = '';
    this.endTime = '';

    this.duration = 0;
    this.order = 1;

    this.isDeleted = false;

    this.createdAt = new Date().toISOString();
    this.createdBy = 0;

    this.updatedAt = undefined;
    this.updatedBy = undefined;

    this.deletedAt = undefined;
    this.deletedBy = undefined;
  }
}

export interface SelectedMediaItem {
    mediaId: number;
    name: string;
    playOrder: number;
}

export class CampaignMediaFilter {
  campaignId?: number;
  screenId?: number;
  playDate?: string;
  offset?: number;
  pageSize?: number;

  constructor() {
    this.campaignId = undefined;
    this.screenId = undefined;
    this.playDate = undefined;
    this.offset = 0;
    this.pageSize = 10;
  }
}

export class CampaignMediaResponse {
  success: boolean;
  message: string;
  data: CampaignMedia[];

  constructor() {
    this.success = false;
    this.message = '';
    this.data = [];
  }
}

export class CampaignMediaRequest {
  campaignId: number;
  screenId: number;
  playDate: string | Date;
  createdBy?: number;
  media: MediaItem[];

  constructor() {
    this.campaignId = 0;
    this.screenId = 0;
    this.playDate = '';
    this.createdBy = 0;
    this.media = [];
  }
}
export class MediaItem {
  mediaId: number;
  playOrder: number;

  constructor() {
    this.mediaId = 0;
    this.playOrder = 1;
  }
}

export class CampaignMediaForm {
  campaignId: number;
  screenId: number;
  mediaId: number;
  playDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  order: number;

  constructor() {
    this.campaignId = 0;
    this.screenId = 0;
    this.mediaId = 0;
    this.playDate = '';
    this.startTime = '';
    this.endTime = '';
    this.duration = 0;
    this.order = 1;
  }
}


export class ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors?: any;

  constructor() {
    this.success = false;
    this.message = null;
    this.data = {} as T;
    this.errors = undefined;
  }
}