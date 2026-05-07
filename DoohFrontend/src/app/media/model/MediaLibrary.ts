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

export interface MediaFilter {
  search?: string;
  isVideo?: boolean;
  deleteMode?: 'active' | 'include' | 'deleted';
  offset?: number; 
  pageSize?: number;
}

export interface MediaLibraryResponse {
  totalRows: number;
  data: MediaLibrary[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}