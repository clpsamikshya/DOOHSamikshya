export interface MediaLibrary {
  id: number;
  tenantId: number;
  name: string;
  url: string;
  resolution: string;
  extension: string;
  duration?: number;
  isVideo: boolean;
  isDeleted: boolean;
  createdAt: string;
  createdBy: number;
}

export class MediaFilter {
  search?: string;
  isVideo?: boolean;
  isDeleted?: boolean;

  constructor() {}
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}