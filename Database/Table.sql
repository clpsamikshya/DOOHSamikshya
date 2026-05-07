CREATE TABLE [core].[User](
    Id INT PRIMARY KEY,
    FirstName VARCHAR(20) NOT NULL,
    LastName VARCHAR(20) NOT NULL,
    [Role] VARCHAR(10)
);

CREATE TABLE [core].[Tenant] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(75) NOT NULL,
    TenancyCode NVARCHAR(50) NOT NULL UNIQUE,
    Country NVARCHAR(50) NULL,
    City NVARCHAR(50) NULL,
    ContactEmail NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,

    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CreatedBy INT NULL,
    UpdatedBy INT NOT NULL,
    DeletedAt DATETIMEOFFSET NULL,
    DeletedBy INT NULL,

    CONSTRAINT FK_Tenant_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_Tenant_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_Tenant_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES [Core].[User](Id)
);

CREATE TABLE [inv].[Screen] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL,
    [Name] NVARCHAR(30) NOT NULL,
    [Location] NVARCHAR(200) NOT NULL,
    Resolution NVARCHAR(20) NOT NULL DEFAULT '1920x1080',
    Tag NVARCHAR(70) NULL,
    Orientation INT NOT NULL DEFAULT 1,
    Status INT NOT NULL DEFAULT 1,

    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CreatedBy INT NULL,
    UpdatedBy INT NOT NULL,
    DeletedAt DATETIMEOFFSET NULL,
    DeletedBy INT NULL,

    CONSTRAINT FK_Screen_Tenant FOREIGN KEY (TenantId) REFERENCES [Core].[Tenant](Id),
    CONSTRAINT FK_Screen_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_Screen_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_Screen_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES [Core].[User](Id)
);

CREATE TABLE [inv].[ScreenOperatingHour] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ScreenId INT NOT NULL,
    StartTime TIME(0) NOT NULL,
    EndTime TIME(0) NOT NULL,
    [DayOfWeek] INT NOT NULL DEFAULT 1,
    AvgAudienceCount INT NOT NULL DEFAULT 0,

    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CreatedBy INT NULL,
    UpdatedBy INT NOT NULL,
    DeletedAt DATETIMEOFFSET NULL,
    DeletedBy INT NULL,

    CONSTRAINT FK_ScreenOperatingHour_Screen FOREIGN KEY (ScreenId) REFERENCES [Inv].[Screen](Id),
    CONSTRAINT FK_ScreenOperatingHour_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_ScreenOperatingHour_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_ScreenOperatingHour_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES [Core].[User](Id)
);

CREATE TABLE [dbo].[MediaLibrary] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [Url] NVARCHAR(500) NOT NULL,
    Resolution NVARCHAR(50) DEFAULT '1920x1080',
    Extension NVARCHAR(15) NOT NULL,
    Duration INT NULL,
    IsVideo BIT NOT NULL,

    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CreatedBy INT NOT NULL,
    DeletedAt DATETIMEOFFSET NULL,
    DeletedBy INT NULL,

    CONSTRAINT FK_MediaLibrary_Tenant FOREIGN KEY (TenantId) REFERENCES [Core].[Tenant](Id),
    CONSTRAINT FK_MediaLibrary_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES [Core].[User](Id),
    CONSTRAINT FK_MediaLibrary_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES [Core].[User](Id)
);

CREATE TABLE [dbo].[Campaign] (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	TenantId INT NOT NULL,
	[Name] NVARCHAR(50) NOT NULL,
	DurationInDays INT NOT NULL,
	[Status] INT NOT NULL DEFAULT 1,
	Remarks NVARCHAR(250) NULL,

	CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
	CreatedBy INT NOT NULL,
	IsDeleted BIT DEFAULT 0,
	DeletedAt DATETIMEOFFSET NULL,
	DeletedBy INT NULL,

	CONSTRAINT FK_Campaign_TenantId FOREIGN KEY(TenantId) REFERENCES core.Tenant(Id),
	CONSTRAINT FK_Campaign_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES core.[User](Id),
	CONSTRAINT FK_Campaign_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES core.[User](Id)
);

CREATE TABLE [dbo].[CampaignDate] (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	CampaignId INT NOT NULL,
	StartDateTime DATETIMEOFFSET  NOT NULL, --
	EndDateTime DATETIMEOFFSET  NOT NULL,--

	CONSTRAINT FK_CampaignDate_CampaignId FOREIGN KEY(CampaignId) REFERENCES dbo.Campaign(Id)
);

CREATE TABLE [dbo].[CampaignScreen] 
(
	Id INT IDENTITY(1,1) PRIMARY KEY,
	CampaignId INT NOT NULL,
	ScreenId INT NOT NULL,

	CONSTRAINT FK_CampaignScreen_CampaignId FOREIGN KEY(CampaignId) REFERENCES dbo.Campaign(Id),
	CONSTRAINT FK_CampaignScreen_ScreenId FOREIGN KEY(ScreenId) REFERENCES inv.Screen(Id)
);

CREATE TABLE [dbo].[CampaignMedia] (
	Id INT IDENTITY(1,1) PRIMARY KEY,
	CampaignId INT NOT NULL,
	ScreenId INT NOT NULL,
	MediaId INT NOT NULL,

    [PlayDate] Date NOT NULL,
	PlayOrder INT NOT NULL,
	
	CreatedBy INT NOT NULL,
	CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

	UpdatedBy INT NOT NULL,
	UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
	
	IsDeleted BIT DEFAULT 0,
	DeletedAt DATETIMEOFFSET NULL,
	DeletedBy INT NULL ,

	CONSTRAINT FK_CampaignMedia_CampaignId FOREIGN KEY(CampaignId) REFERENCES dbo.Campaign(Id),
	CONSTRAINT FK_CampaignMedia_MediaId FOREIGN KEY(MediaId) REFERENCES dbo.MediaLibrary(Id),
	CONSTRAINT FK_CampaignMedia_ScreenId FOREIGN KEY(ScreenId) REFERENCES inv.Screen(Id),
	CONSTRAINT FK_CampaignMedia_CreatedBy FOREIGN KEY(CreatedBy) REFERENCES core.[User](Id),
	CONSTRAINT FK_CampaignMedia_UpdatedBy FOREIGN KEY(UpdatedBy) REFERENCES core.[User](Id),
	CONSTRAINT FK_CampaignMedia_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES core.[User](Id)
);

CREATE TABLE [report].[ProofOfPlay] (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ScreenId INT NOT NULL,
    MediaId INT NOT NULL,
    CampaignId INT NOT NULL,
    PlayedAt DATETIMEOFFSET NOT NULL,
    PlayedDuration INT NOT NULL,
    Status INT NOT NULL DEFAULT 1,

    CONSTRAINT FK_ProofOfPlay_Screen FOREIGN KEY (ScreenId) REFERENCES [Inv].[Screen](Id),
    CONSTRAINT FK_ProofOfPlay_Media FOREIGN KEY (MediaId) REFERENCES [dbo].[MediaLibrary](Id),
    CONSTRAINT FK_ProofOfPlay_Campaign FOREIGN KEY (CampaignId) REFERENCES [dbo].[Campaign](Id)
);


