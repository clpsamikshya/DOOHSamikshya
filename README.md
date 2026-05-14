#  DOOH Ad Manager System

A Digital Out-of-Home (DOOH) advertising management system for managing screens, media assets, and campaign-based scheduling across multiple tenants.

---

# 1. Technology Stack

- Backend: ASP.NET Core Web API  
- Frontend: Angular 20  
- Database: Microsoft SQL Server  
- API Documentation: Swagger  

---

# 2. Core Features

- Screen management for digital displays  
- Screen operating hour configuration  
- Media library for image and video assets  
- Campaign-based advertising setup  
- Assignment of screens to campaigns  
- Ordered media playback scheduling  
- Multi-tenant support  
- User-based audit tracking (CreatedBy, UpdatedBy, DeletedBy)  

---

# 3. System Modules

## 3.1 Screen (inv.Screen)

Represents physical digital display screens.

### Fields

- Id (INT, PK)  
- TenantId (FK → Core.Tenant)  
- Name  
- Location  
- Resolution  
- Tag  
- Orientation  
- Status  
- IsDeleted  
- CreatedAt  
- UpdatedAt  
- CreatedBy  
- UpdatedBy  
- DeletedAt  
- DeletedBy  

---

## 3.2 Screen Operating Hours (inv.ScreenOperatingHour)

Defines when a screen is active.

### Fields

- Id (INT, PK)  
- ScreenId (FK → Screen)  
- StartTime  
- EndTime  
- DayOfWeek  
- AvgAudienceCount  
- IsDeleted  
- CreatedAt  
- UpdatedAt  
- CreatedBy  
- UpdatedBy  
- DeletedAt  
- DeletedBy  

---

## 3.3 Media Library (dbo.MediaLibrary)

Stores all media assets used in campaigns.

### Fields

- Id (INT, PK)  
- TenantId (FK → Core.Tenant)  
- Name  
- Url  
- Resolution  
- Extension  
- Duration  
- IsVideo  
- IsDeleted  
- CreatedAt  
- CreatedBy  
- DeletedAt  
- DeletedBy  

---

## 3.4 Campaign (dbo.Campaign)

Defines advertising campaigns.

### Fields

- Id (INT, PK)  
- TenantId (FK → Core.Tenant)  
- Name  
- DurationInDays  
- Status  
- Remarks  
- CreatedAt  
- CreatedBy  
- IsDeleted  
- DeletedAt  
- DeletedBy  

---

## 3.5 Campaign Date (dbo.CampaignDate)

Defines campaign active time period.

### Fields

- Id (INT, PK)  
- CampaignId (FK → Campaign)  
- StartDateTime  
- EndDateTime  

---

## 3.6 Campaign Screen (dbo.CampaignScreen)

Maps campaigns to screens.

### Fields

- Id (INT, PK)  
- CampaignId (FK → Campaign)  
- ScreenId (FK → Screen)  

---

## 3.7 Campaign Media (dbo.CampaignMedia)

Defines scheduled media playback for campaigns.

### Fields

- Id (INT, PK)  
- CampaignId (FK → Campaign)  
- ScreenId (FK → Screen)  
- MediaId (FK → MediaLibrary)  
- PlayDate  
- PlayOrder  
- CreatedAt  
- CreatedBy  
- UpdatedAt  
- UpdatedBy  
- IsDeleted  
- DeletedAt  
- DeletedBy  

---

## 3.8 Core Tables

### Tenant (core.Tenant)

- Id  
- Name  

### User (core.User)

- Id  
- Name  

Used for multi-tenant support and audit tracking.

---

# 4. API Endpoints (Swagger)

## 4.1 Screen API

- GET `/api/Screen`  
- GET `/api/Screen/ddl`  
- POST `/api/Screen`  
- PUT `/api/Screen`  
- DELETE `/api/Screen/{id}`  
- DELETE `/api/Screen/operating-hour/{id}`  

---

## 4.2 Media Library API

- GET `/api/MediaLibrary`  
- GET `/api/MediaLibrary/ddl`  
- POST `/api/MediaLibrary/upload`  
- DELETE `/api/MediaLibrary/{id}`  

---

## 4.3 Campaign API

- GET `/api/CampaignContoller`  
- POST `/api/CampaignContoller`  
- DELETE `/api/CampaignContoller/{id}`  

---

## 4.4 Campaign Media API

- GET `/api/CampaignMedia`  
- POST `/api/CampaignMedia`  
- PUT `/api/CampaignMedia`  
- DELETE `/api/CampaignMedia/{id}`  
