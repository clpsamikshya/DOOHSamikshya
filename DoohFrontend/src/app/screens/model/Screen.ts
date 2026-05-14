import { ScreenStatus, ScreenOrientation, ScreenResolution } from "./ScreenEnum";  

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
}

export class Screens {
  id: number;
  tenantId: number;
  name: string;
  location: string;
  resolution: string;
  tag: string[] | null;

  orientation: ScreenOrientation;
  status: ScreenStatus;

  isDeleted: boolean;

  createdAt?: string;
  updatedAt?: string;
  createdBy: number | null;
  updatedBy: number;
  deletedAt?: string | null;
  deletedBy?: number | null;

  operatingHour: ScreenOperatingHour[];

  constructor() {
    this.id = 0;
    this.tenantId = 0;
    this.name = '';
    this.location = '';
    this.resolution = '';

    this.tag = null;

    this.orientation = ScreenOrientation.Landscape;
    this.status = ScreenStatus.Active;      

    this.isDeleted = false;

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.createdBy = null;
    this.updatedBy = 0;
    this.deletedAt = null;
    this.deletedBy = null;

    this.operatingHour = [];
  }
}

export interface DropdownItemScreen {
    id: number;
    name: string;
}

export class ScreenOperatingHour {
  id: number;
  screenId: number;

  startTime: string;
  endTime: string;
  dayOfWeek: number;
  avgAudienceCount: number;

  isDeleted: boolean;

  createdAt?: string;
  updatedAt?: string;
  createdBy: number | null;
  updatedBy: number;
  deletedAt: string | null;
  deletedBy?: number | null;
  //isEveryday?: boolean;

  constructor() {
    this.id = 0;
    this.screenId = 0;

    this.startTime = '00:00:00';
    this.endTime = '00:00:00';
    this.dayOfWeek = 0;
    this.avgAudienceCount = 0;

    this.isDeleted = false;
   // this.isEveryday = false;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.createdBy = null;
    this.updatedBy = 0;
    this.deletedAt = null;
    this.deletedBy = null;
  }
}

export interface OperatingHourSlot {
  id: string;
  selectedDays: number[];
  startTime: string;
  endTime: string;
  avgAudienceCount: number;
}

export interface ScreenFilter {
  search?: string;
  status?: ScreenStatus | null;
  orientation?: ScreenOrientation | null;
  offset?: number;
  pageSize?: number;
}

export interface ScreenResponse {
  totalRows: number;
  data: Screens[];
}

export class ScreenInsert {
  tenantId: number;
  name: string;
  location: string;
  //resolution: string;
  tag: string[] | null;
  resolution : ScreenResolution;
  orientation: ScreenOrientation;
  status: ScreenStatus;

  createdBy: number;

  operatingHour: ScreenOperatingHour[];

  constructor() {
    this.tenantId = 0;
    this.name = '';
    this.location = '';
    this.resolution = ScreenResolution.R1920x1080;

    this.tag = null;

    this.orientation = ScreenOrientation.Landscape;
    this.status = ScreenStatus.Active;

    this.createdBy = 1;

    this.operatingHour = [];
  }
}

export class ScreenUpdate {
  id: number;

  name: string;
  location: string;
  resolution : ScreenResolution;
  tag: string[] | null;

  orientation: ScreenOrientation;
  status: ScreenStatus;

  updatedBy: number;

  operatingHour: ScreenOperatingHour[];

  constructor() {
    this.id = 0;

    this.name = '';
    this.location = '';
    this.resolution = ScreenResolution.R1920x1080;

    this.tag = null;

    this.orientation = ScreenOrientation.Landscape;
    this.status = ScreenStatus.Active;

    this.updatedBy = 1;

    this.operatingHour = [];
  }
}





