USE [Samikshya_Dooh]
GO

DELETE FROM inv.ScreenOperatingHour;
DELETE FROM inv.Screen;
Delete FROM dbo.MediaLibrary

DBCC CHECKIDENT ('inv.ScreenOperatingHour', RESEED, 0);
DBCC CHECKIDENT ('inv.Screen', RESEED, 0);
DBCC CHECKIDENT ('dbo.MediaLibrary', RESEED, 0);

Select * from inv.Screen
select * from inv.ScreenOperatingHour
select * from core.Tenant
select * from dbo.MediaLibrary


-- ================================================
-- PRE-TEST SETUP
-- ================================================

-- Clean up any leftover test data from previous runs
UPDATE inv.Screen 
SET IsDeleted = 1 
WHERE Name LIKE 'QA_%' AND IsDeleted = 0;

-- ================================================
-- 1. INSERT TESTS (SpScreenIns)
-- ================================================
PRINT '================================================';
PRINT 'INSERT TESTS';
PRINT '================================================';

-- -----------------------------------------------
-- 1.1 HAPPY PATH
-- -----------------------------------------------

-- TC-INS-01: Full valid insert with all fields + operating hours
PRINT '-- TC-INS-01: Full valid insert';
BEGIN TRY
    DECLARE @Json01 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_Full",
        "Location": "27.7172,85.3240",
        "Resolution": "1920x1080",
        "Tag": ["mall","outdoor","digital"],
        "Orientation": 1,
        "Status": 1,
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":1,"AvgAudienceCount":500},
            {"StartTime":"09:00:00","EndTime":"18:00:00","DayOfWeek":2,"AvgAudienceCount":300},
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":3,"AvgAudienceCount":400},
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":4,"AvgAudienceCount":450},
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":5,"AvgAudienceCount":600},
            {"StartTime":"10:00:00","EndTime":"16:00:00","DayOfWeek":6,"AvgAudienceCount":200},
            {"StartTime":"10:00:00","EndTime":"16:00:00","DayOfWeek":7,"AvgAudienceCount":150}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json01 OUTPUT;
    PRINT 'TC-INS-01: PASSED';
    SELECT @Json01 AS [TC-INS-01 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-INS-01: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-02: Minimal valid insert (only required fields)
PRINT '-- TC-INS-02: Minimal valid insert';
BEGIN TRY
    DECLARE @Json02 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_Min",
        "Location": "27.7200,85.3300",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json02 OUTPUT;
    PRINT 'TC-INS-02: PASSED';
    SELECT @Json02 AS [TC-INS-02 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-INS-02: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-03: Insert without operating hours
PRINT '-- TC-INS-03: Insert without operating hours';
BEGIN TRY
    DECLARE @Json03 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_NoHours",
        "Location": "27.7300,85.3400",
        "Resolution": "3840x2160",
        "Tag": ["indoor","led"],
        "Orientation": 2,
        "Status": 1,
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json03 OUTPUT;
    PRINT 'TC-INS-03: PASSED';
    SELECT @Json03 AS [TC-INS-03 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-INS-03: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-04: Insert with negative latitude (valid)
PRINT '-- TC-INS-04: Negative latitude';
BEGIN TRY
    DECLARE @Json04 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_NegLat",
        "Location": "-27.7172,85.3240",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json04 OUTPUT;
    PRINT 'TC-INS-04: PASSED';
    SELECT @Json04 AS [TC-INS-04 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-INS-04: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-05: Defaults applied (Resolution, Orientation, Status)
PRINT '-- TC-INS-05: Verify defaults applied';
BEGIN TRY
    DECLARE @Json05 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_Defaults",
        "Location": "27.7400,85.3500",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json05 OUTPUT;
    -- Verify defaults in DB
    SELECT Id, Name, Resolution, Orientation, Status 
    FROM inv.Screen 
    WHERE Name = 'QA_Screen_Defaults' AND IsDeleted = 0;
    -- Expected: Resolution=1920x1080, Orientation=1, Status=1
    PRINT 'TC-INS-05: PASSED';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-05: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- -----------------------------------------------
-- 1.2 VALIDATION / ERROR PATH
-- -----------------------------------------------

-- TC-INS-06: Empty JSON (expect 50001)
PRINT '-- TC-INS-06: Empty JSON';
BEGIN TRY
    DECLARE @Json06 NVARCHAR(MAX) = N'{}';
    EXEC [inv].[SpScreenIns] @JSON = @Json06 OUTPUT;
    PRINT 'TC-INS-06: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-06: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-07: Missing TenantId (expect 50002)
PRINT '-- TC-INS-07: Missing TenantId';
BEGIN TRY
    DECLARE @Json07 NVARCHAR(MAX) = N'{
        "Name": "QA_Screen_NoTenant",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json07 OUTPUT;
    PRINT 'TC-INS-07: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-07: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-08: Missing Name (expect 50002)
PRINT '-- TC-INS-08: Missing Name';
BEGIN TRY
    DECLARE @Json08 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Location": "27.7172,85.3240",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json08 OUTPUT;
    PRINT 'TC-INS-08: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-08: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-09: Name too short < 3 chars (expect 50003)
PRINT '-- TC-INS-09: Name too short';
BEGIN TRY
    DECLARE @Json09 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "AB",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json09 OUTPUT;
    PRINT 'TC-INS-09: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-09: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-10: Duplicate screen name same tenant (expect 50005)
PRINT '-- TC-INS-10: Duplicate name';
BEGIN TRY
    DECLARE @Json10 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_Full",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json10 OUTPUT;
    PRINT 'TC-INS-10: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-10: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-11: Invalid location format (expect 50006)
PRINT '-- TC-INS-11: Invalid location format';
BEGIN TRY
    DECLARE @Json11 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadLoc",
        "Location": "Kathmandu",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json11 OUTPUT;
    PRINT 'TC-INS-11: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-11: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-12: Location 0,0 (expect 50007)
PRINT '-- TC-INS-12: Location 0,0';
BEGIN TRY
    DECLARE @Json12 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_ZeroLoc",
        "Location": "0,0",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json12 OUTPUT;
    PRINT 'TC-INS-12: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-12: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-13: Invalid resolution (expect 50008)
PRINT '-- TC-INS-13: Invalid resolution';
BEGIN TRY
    DECLARE @Json13 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadRes",
        "Location": "27.7172,85.3240",
        "Resolution": "1234x5678",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json13 OUTPUT;
    PRINT 'TC-INS-13: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-13: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-14: Invalid orientation (expect 50009)
PRINT '-- TC-INS-14: Invalid orientation';
BEGIN TRY
    DECLARE @Json14 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadOri",
        "Location": "27.7172,85.3240",
        "Orientation": 5,
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json14 OUTPUT;
    PRINT 'TC-INS-14: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-14: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-15: Invalid status (expect 50010)
PRINT '-- TC-INS-15: Invalid status';
BEGIN TRY
    DECLARE @Json15 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadStatus",
        "Location": "27.7172,85.3240",
        "Status": 9,
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json15 OUTPUT;
    PRINT 'TC-INS-15: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-15: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-16: Invalid tag not JSON array (expect 50011)
PRINT '-- TC-INS-16: Tag not JSON array';
BEGIN TRY
    DECLARE @Json16 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadTag",
        "Location": "27.7172,85.3240",
        "Tag": "mall,outdoor",
        "CreatedBy": 1
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json16 OUTPUT;
    PRINT 'TC-INS-16: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-16: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-17: StartTime >= EndTime (expect 50012)
PRINT '-- TC-INS-17: StartTime >= EndTime';
BEGIN TRY
    DECLARE @Json17 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadTime",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"20:00:00","EndTime":"08:00:00","DayOfWeek":1,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json17 OUTPUT;
    PRINT 'TC-INS-17: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-17: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-17B: StartTime equals EndTime (expect 50012)
PRINT '-- TC-INS-17B: StartTime equals EndTime';
BEGIN TRY
    DECLARE @Json17B NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_EqualTime",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"08:00:00","EndTime":"08:00:00","DayOfWeek":1,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json17B OUTPUT;
    PRINT 'TC-INS-17B: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-17B: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-17C: EndTime before StartTime e.g. 18:00 - 15:00 (expect 50012)
PRINT '-- TC-INS-17C: EndTime before StartTime (18:00 to 15:00)';
BEGIN TRY
    DECLARE @Json17C NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_RevTime",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"18:00:00","EndTime":"15:00:00","DayOfWeek":1,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json17C OUTPUT;
    PRINT 'TC-INS-17C: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-17C: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-17D: Duration exactly 24 hours (valid edge case - should PASS)
PRINT '-- TC-INS-17D: Exactly 24 hours duration (valid)';
BEGIN TRY
    DECLARE @Json17D NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_24Hours",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"00:00:00","EndTime":"23:59:59","DayOfWeek":1,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json17D OUTPUT;
    PRINT 'TC-INS-17D: PASSED';
    SELECT @Json17D AS [TC-INS-17D Result];
    -- Cleanup
    UPDATE inv.Screen SET IsDeleted = 1 
    WHERE Name = 'QA_Screen_24Hours' AND IsDeleted = 0;
END TRY
BEGIN CATCH
    PRINT 'TC-INS-17D: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-17E: More than 24 hours (impossible with TIME datatype)
PRINT '-- TC-INS-17G: More than 24 hours';
BEGIN TRY
    DECLARE @Json17G NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_Over24",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"00:00:00","EndTime":"25:00:00","DayOfWeek":1,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json17G OUTPUT;
    PRINT 'TC-INS-17G: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-17G: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-18: Operating duration < 30 mins (expect 50013)
PRINT '-- TC-INS-18: Duration less than 30 mins';
BEGIN TRY
    DECLARE @Json18 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_ShortDur",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"08:00:00","EndTime":"08:20:00","DayOfWeek":1,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json18 OUTPUT;
    PRINT 'TC-INS-18: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-18: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-19: DayOfWeek out of range (expect 50015)
PRINT '-- TC-INS-19: DayOfWeek out of range';
BEGIN TRY
    DECLARE @Json19 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_BadDay",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":9,"AvgAudienceCount":100}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json19 OUTPUT;
    PRINT 'TC-INS-19: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-19: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-20: Duplicate DayOfWeek (expect 50016)
PRINT '-- TC-INS-20: Duplicate DayOfWeek';
BEGIN TRY
    DECLARE @Json20 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_DupDay",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":1,"AvgAudienceCount":100},
            {"StartTime":"09:00:00","EndTime":"18:00:00","DayOfWeek":1,"AvgAudienceCount":200}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json20 OUTPUT;
    PRINT 'TC-INS-20: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-20: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-INS-21: Negative AvgAudienceCount (expect 50017)
PRINT '-- TC-INS-21: Negative AvgAudienceCount';
BEGIN TRY
    DECLARE @Json21 NVARCHAR(MAX) = N'{
        "TenantId": 1,
        "Name": "QA_Screen_NegAud",
        "Location": "27.7172,85.3240",
        "CreatedBy": 1,
        "OperatingHour": [
            {"StartTime":"08:00:00","EndTime":"20:00:00","DayOfWeek":1,"AvgAudienceCount":-1}
        ]
    }';
    EXEC [inv].[SpScreenIns] @JSON = @Json21 OUTPUT;
    PRINT 'TC-INS-21: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-INS-21: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- ================================================
-- 2. SELECT TESTS (SpScreenSel)
-- ================================================
PRINT '================================================';
PRINT 'SELECT TESTS';
PRINT '================================================';

-- TC-SEL-01: Get all screens latest first
PRINT '-- TC-SEL-01: Get all screens';
BEGIN TRY
    DECLARE @SelResult NVARCHAR(MAX);
    EXEC [inv].[SpScreenSel];
    PRINT 'TC-SEL-01: PASSED';
END TRY
BEGIN CATCH
    PRINT 'TC-SEL-01: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-SEL-02: Verify QA screens exist
PRINT '-- TC-SEL-02: Verify QA screens in DB';
SELECT Id, Name, Resolution, Orientation, Status, IsDeleted, CreatedAt
FROM inv.Screen
WHERE Name LIKE 'QA_%' AND IsDeleted = 0
ORDER BY CreatedAt DESC;
PRINT 'TC-SEL-02: PASSED';

-- TC-SEL-03: Verify operating hours saved correctly
PRINT '-- TC-SEL-03: Verify operating hours';
SELECT 
    s.Name,
    oh.DayOfWeek,
    oh.StartTime,
    oh.EndTime,
    oh.AvgAudienceCount,
    oh.IsDeleted
FROM inv.ScreenOperatingHour oh
INNER JOIN inv.Screen s ON s.Id = oh.ScreenId
WHERE s.Name = 'QA_Screen_Full'
ORDER BY oh.DayOfWeek;
-- Expected: 7 rows, all IsDeleted = 0
PRINT 'TC-SEL-03: PASSED';

-- TC-SEL-04: Verify latest screen is first
PRINT '-- TC-SEL-04: Verify latest first ordering';
SELECT TOP 1 Name, CreatedAt 
FROM inv.Screen 
WHERE IsDeleted = 0
ORDER BY CreatedAt DESC;
PRINT 'TC-SEL-04: PASSED';

-- TC-SEL-05: Verify defaults were applied correctly
PRINT '-- TC-SEL-05: Verify default values';
SELECT Name, Resolution, Orientation, Status
FROM inv.Screen
WHERE Name = 'QA_Screen_Defaults' AND IsDeleted = 0;
-- Expected: Resolution=1920x1080, Orientation=1, Status=1
PRINT 'TC-SEL-05: PASSED';

-- ================================================
-- 3. UPDATE TESTS (SpScreenUpd)
-- ================================================
PRINT '================================================';
PRINT 'UPDATE TESTS';
PRINT '================================================';

-- Check current QA screens and their IDs first
SELECT Id, Name FROM inv.Screen 
WHERE Name LIKE 'QA_%' AND IsDeleted = 0
ORDER BY CreatedAt;

-- -----------------------------------------------
-- 3.1 HAPPY PATH
-- -----------------------------------------------

-- TC-UPD-01: Full update all fields
PRINT '-- TC-UPD-01: Full update';
BEGIN TRY
    DECLARE @JsonUpd01 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Name": "QA_Screen_Updated",
        "Location": "27.7500,85.3600",
        "Resolution": "3840x2160",
        "Tag": ["mall","indoor","led"],
        "Orientation": 2,
        "Status": 1,
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd01 OUTPUT;
    PRINT 'TC-UPD-01: PASSED';
    SELECT @JsonUpd01 AS [TC-UPD-01 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-01: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- Verify TC-UPD-01 values in DB
SELECT 
    Id,
    Name,                            -- Expected: QA_Screen_Updated
    Location,                        -- Expected: 27.7500,85.3600
    Resolution,                      -- Expected: 3840x2160
    JSON_QUERY(Tag) AS Tag,          -- Expected: ["mall","indoor","led"]
    Orientation,                     -- Expected: 2
    Status,                          -- Expected: 1
    UpdatedBy,                       -- Expected: 1
    UpdatedAt                        -- Expected: recent timestamp
FROM inv.Screen WHERE Id = 5;

-- TC-UPD-02: Partial update Name only (other fields must stay unchanged)
PRINT '-- TC-UPD-02: Partial update Name only';
BEGIN TRY
    DECLARE @JsonUpd02 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Name": "QA_Screen_NameOnly",
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd02 OUTPUT;
    PRINT 'TC-UPD-02: PASSED';
    SELECT @JsonUpd02 AS [TC-UPD-02 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-02: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- Verify TC-UPD-02: only Name changed, everything else same as UPD-01
SELECT 
    Name,                            -- Expected: QA_Screen_NameOnly (changed)
    Location,                        -- Expected: 27.7500,85.3600   (unchanged)
    Resolution,                      -- Expected: 3840x2160          (unchanged)
    JSON_QUERY(Tag) AS Tag,          -- Expected: ["mall","indoor","led"] (unchanged)
    Orientation,                     -- Expected: 2                  (unchanged)
    Status                           -- Expected: 1                  (unchanged)
FROM inv.Screen WHERE Id = 5;

-- TC-UPD-03: Partial update Status only
PRINT '-- TC-UPD-03: Partial update Status only';
BEGIN TRY
    DECLARE @JsonUpd03 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Status": 0,
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd03 OUTPUT;
    PRINT 'TC-UPD-03: PASSED';
    SELECT @JsonUpd03 AS [TC-UPD-03 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-03: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- Verify TC-UPD-03: only Status changed
SELECT 
    Name,                            -- Expected: QA_Screen_NameOnly (unchanged)
    Status,                          -- Expected: 0                  (changed)
    Orientation,                     -- Expected: 2                  (unchanged)
    JSON_QUERY(Tag) AS Tag           -- Expected: ["mall","indoor","led"] (unchanged)
FROM inv.Screen WHERE Id = 5;

-- TC-UPD-04: Update Tag to new array
PRINT '-- TC-UPD-04: Update Tag array';
BEGIN TRY
    DECLARE @JsonUpd04 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Tag": ["highway","billboard"],
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd04 OUTPUT;
    PRINT 'TC-UPD-04: PASSED';
    SELECT @JsonUpd04 AS [TC-UPD-04 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-04: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- Verify TC-UPD-04: Tag updated
SELECT 
    JSON_QUERY(Tag) AS Tag,          -- Expected: ["highway","billboard"]
    Name,                            -- Expected: QA_Screen_NameOnly (unchanged)
    Status                           -- Expected: 0 (unchanged)
FROM inv.Screen WHERE Id = 5;

-- TC-UPD-05: Clear Tag to null explicitly
PRINT '-- TC-UPD-05: Clear Tag to null';
BEGIN TRY
    DECLARE @JsonUpd05 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Tag": null,
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd05 OUTPUT;
    PRINT 'TC-UPD-05: PASSED';
    SELECT @JsonUpd05 AS [TC-UPD-05 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-05: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- Verify TC-UPD-05: Tag is null
SELECT 
    JSON_QUERY(Tag) AS Tag,          -- Expected: null
    Name,                            -- Expected: QA_Screen_NameOnly (unchanged)
    Status                           -- Expected: 0 (unchanged)
FROM inv.Screen WHERE Id = 5;

-- TC-UPD-06: Tag not sent at all — must keep existing value
PRINT '-- TC-UPD-06: Tag not sent keeps existing';
BEGIN TRY
    DECLARE @JsonUpd06 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Status": 1,
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd06 OUTPUT;
    PRINT 'TC-UPD-06: PASSED';
    SELECT @JsonUpd06 AS [TC-UPD-06 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-06: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- Verify TC-UPD-06: Tag still null (was null before, key not sent)
SELECT 
    JSON_QUERY(Tag) AS Tag,          -- Expected: null (kept from previous)
    Status                           -- Expected: 1 (changed)
FROM inv.Screen WHERE Id = 5;

-- TC-UPD-07: Verify UpdatedAt changes on every update
PRINT '-- TC-UPD-07: Verify UpdatedAt timestamp';
SELECT 
    Id,
    Name,
    UpdatedAt,                       -- Expected: most recent timestamp
    UpdatedBy                        -- Expected: 1
FROM inv.Screen WHERE Id = 5;
PRINT 'TC-UPD-07: Check UpdatedAt is recent';

-- -----------------------------------------------
-- 3.2 ERROR PATH
-- -----------------------------------------------

-- TC-UPD-08: Missing Id (expect 50002)
PRINT '-- TC-UPD-08: Missing Id';
BEGIN TRY
    DECLARE @JsonUpd08 NVARCHAR(MAX) = N'{
        "Name": "QA_No_Id",
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd08 OUTPUT;
    PRINT 'TC-UPD-08: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-08: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-09: Missing UpdatedBy (expect 50002)
PRINT '-- TC-UPD-09: Missing UpdatedBy';
BEGIN TRY
    DECLARE @JsonUpd09 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Name": "QA_No_UpdatedBy"
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd09 OUTPUT;
    PRINT 'TC-UPD-09: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-09: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-10: Non-existent screen Id (expect 50003)
PRINT '-- TC-UPD-10: Non-existent screen';
BEGIN TRY
    DECLARE @JsonUpd10 NVARCHAR(MAX) = N'{
        "Id": 99999,
        "Name": "QA_Ghost",
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd10 OUTPUT;
    PRINT 'TC-UPD-10: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-10: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-11: Duplicate name same tenant (expect 50004)
-- Try to rename Id=5 to same name as Id=6 (QA_Screen_Min)
PRINT '-- TC-UPD-11: Duplicate name on update';
BEGIN TRY
    DECLARE @JsonUpd11 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Name": "QA_Screen_Min",
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd11 OUTPUT;
    PRINT 'TC-UPD-11: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-11: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-12: Invalid location format (expect 50005)
PRINT '-- TC-UPD-12: Invalid location';
BEGIN TRY
    DECLARE @JsonUpd12 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Location": "not-a-location",
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd12 OUTPUT;
    PRINT 'TC-UPD-12: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-12: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-13: Invalid orientation (expect error)
PRINT '-- TC-UPD-13: Invalid orientation';
BEGIN TRY
    DECLARE @JsonUpd13 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Orientation": 5,
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd13 OUTPUT;
    PRINT 'TC-UPD-13: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-13: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-14: Invalid status (expect error)
PRINT '-- TC-UPD-14: Invalid status';
BEGIN TRY
    DECLARE @JsonUpd14 NVARCHAR(MAX) = N'{
        "Id": 5,
        "Status": 9,
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd14 OUTPUT;
    PRINT 'TC-UPD-14: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-14: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-UPD-15: Update deleted screen (expect 50003)
PRINT '-- TC-UPD-15: Update deleted screen';
BEGIN TRY
    -- Use a screen you already deleted in INS cleanup
    DECLARE @JsonUpd15 NVARCHAR(MAX) = N'{
        "Id": 10,
        "Name": "QA_Should_Fail",
        "UpdatedBy": 1
    }';
    EXEC [inv].[SpScreenUpd] @Json = @JsonUpd15 OUTPUT;
    PRINT 'TC-UPD-15: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-UPD-15: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- -----------------------------------------------
-- 3.3 FINAL STATE CHECK
-- -----------------------------------------------
PRINT '-- Final state of screen Id 5 after all updates:';
SELECT
    Id,
    Name,                            -- Expected: QA_Screen_NameOnly
    Location,                        -- Expected: 27.7500,85.3600
    Resolution,                      -- Expected: 3840x2160
    JSON_QUERY(Tag) AS Tag,          -- Expected: null
    Orientation,                     -- Expected: 2
    Status,                          -- Expected: 1
    UpdatedBy,                       -- Expected: 1
    UpdatedAt,                       -- Expected: most recent timestamp
    IsDeleted                        -- Expected: 0
FROM inv.Screen
WHERE Id = 5;

-- ================================================
-- 4. DELETE TESTS (SpScreenDel)
-- ================================================
PRINT '================================================';
PRINT 'DELETE TESTS';
PRINT '================================================';

DECLARE @DelScreenId1 INT = (
    SELECT Id FROM inv.Screen 
    WHERE Name = 'QA_Screen_Min' AND IsDeleted = 0
);
DECLARE @DelScreenId2 INT = (
    SELECT Id FROM inv.Screen 
    WHERE Name = 'QA_Screen_NoHours' AND IsDeleted = 0
);
DECLARE @DelScreenId3 INT = (
    SELECT Id FROM inv.Screen 
    WHERE Name = 'QA_Screen_NameOnly' AND IsDeleted = 0
);

-- TC-DEL-01: Delete without cascade
PRINT '-- TC-DEL-01: Delete without cascade';
BEGIN TRY
    DECLARE @JsonDel01 NVARCHAR(MAX) = N'{
        "ScreenId": ' + CAST(@DelScreenId1 AS NVARCHAR) + N',
        "DeletedBy": 1,
        "CascadeDelete": 0
    }';
    EXEC [inv].[SpScreenDel] @Json = @JsonDel01 OUTPUT;
    PRINT 'TC-DEL-01: PASSED';
    SELECT @JsonDel01 AS [TC-DEL-01 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-DEL-01: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-DEL-02: Delete with cascade (deletes operating hours too)
PRINT '-- TC-DEL-02: Delete with cascade';
BEGIN TRY
    DECLARE @JsonDel02 NVARCHAR(MAX) = N'{
        "ScreenId": ' + CAST(@DelScreenId3 AS NVARCHAR) + N',
        "DeletedBy": 1,
        "CascadeDelete": 1
    }';
    EXEC [inv].[SpScreenDel] @Json = @JsonDel02 OUTPUT;
    PRINT 'TC-DEL-02: PASSED';
    SELECT @JsonDel02 AS [TC-DEL-02 Result];
END TRY
BEGIN CATCH
    PRINT 'TC-DEL-02: FAILED - ' + ERROR_MESSAGE();
END CATCH

-- TC-DEL-03: Verify screen soft deleted (IsDeleted = 1)
PRINT '-- TC-DEL-03: Verify soft delete';
SELECT Id, Name, IsDeleted, DeletedAt, DeletedBy
FROM inv.Screen
WHERE Id IN (@DelScreenId1, @DelScreenId3);
-- Expected: IsDeleted = 1, DeletedAt is set, DeletedBy = 1
PRINT 'TC-DEL-03: PASSED';

-- TC-DEL-04: Verify cascade deleted operating hours
PRINT '-- TC-DEL-04: Verify cascade on operating hours';
SELECT oh.Id, oh.ScreenId, oh.IsDeleted, oh.DeletedAt
FROM inv.ScreenOperatingHour oh
WHERE oh.ScreenId = @DelScreenId3;
-- Expected: All rows IsDeleted = 1
PRINT 'TC-DEL-04: PASSED';

-- TC-DEL-05: Verify non-cascade delete kept operating hours
PRINT '-- TC-DEL-05: Verify non-cascade kept operating hours';
SELECT oh.Id, oh.ScreenId, oh.IsDeleted
FROM inv.ScreenOperatingHour oh
WHERE oh.ScreenId = @DelScreenId1;
-- Expected: IsDeleted = 0 (hours untouched)
PRINT 'TC-DEL-05: PASSED';

-- TC-DEL-06: Delete already deleted screen (expect 50003)
PRINT '-- TC-DEL-06: Delete already deleted screen';
BEGIN TRY
    DECLARE @JsonDel06 NVARCHAR(MAX) = N'{
        "ScreenId": ' + CAST(@DelScreenId1 AS NVARCHAR) + N',
        "DeletedBy": 1,
        "CascadeDelete": 0
    }';
    EXEC [inv].[SpScreenDel] @Json = @JsonDel06 OUTPUT;
    PRINT 'TC-DEL-06: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-DEL-06: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-DEL-07: Missing ScreenId (expect 50001)
PRINT '-- TC-DEL-07: Missing ScreenId';
BEGIN TRY
    DECLARE @JsonDel07 NVARCHAR(MAX) = N'{
        "DeletedBy": 1,
        "CascadeDelete": 0
    }';
    EXEC [inv].[SpScreenDel] @Json = @JsonDel07 OUTPUT;
    PRINT 'TC-DEL-07: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-DEL-07: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-DEL-08: Missing DeletedBy (expect 50002)
PRINT '-- TC-DEL-08: Missing DeletedBy';
BEGIN TRY
    DECLARE @JsonDel08 NVARCHAR(MAX) = N'{
        "ScreenId": ' + CAST(@DelScreenId2 AS NVARCHAR) + N',
        "CascadeDelete": 0
    }';
    EXEC [inv].[SpScreenDel] @Json = @JsonDel08 OUTPUT;
    PRINT 'TC-DEL-08: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-DEL-08: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- TC-DEL-09: Non-existent ScreenId (expect 50003)
PRINT '-- TC-DEL-09: Non-existent ScreenId';
BEGIN TRY
    DECLARE @JsonDel09 NVARCHAR(MAX) = N'{
        "ScreenId": 99999,
        "DeletedBy": 1,
        "CascadeDelete": 0
    }';
    EXEC [inv].[SpScreenDel] @Json = @JsonDel09 OUTPUT;
    PRINT 'TC-DEL-09: FAILED (should have thrown error)';
END TRY
BEGIN CATCH
    PRINT 'TC-DEL-09: PASSED - ' + ERROR_MESSAGE();
END CATCH

-- ================================================
-- 5. FINAL STATE VERIFICATION
-- ================================================
PRINT '================================================';
PRINT 'FINAL STATE';
PRINT '================================================';

-- All QA screens final state
SELECT 
    Id, 
    Name, 
    Status,
    IsDeleted,
    CreatedAt,
    UpdatedAt,
    DeletedAt
FROM inv.Screen
WHERE Name LIKE 'QA_%'
ORDER BY CreatedAt DESC;

-- All operating hours for QA screens
SELECT 
    s.Name AS ScreenName,
    oh.DayOfWeek,
    oh.StartTime,
    oh.EndTime,
    oh.AvgAudienceCount,
    oh.IsDeleted
FROM inv.ScreenOperatingHour oh
INNER JOIN inv.Screen s ON s.Id = oh.ScreenId
WHERE s.Name LIKE 'QA_%'
ORDER BY s.Name, oh.DayOfWeek;

-- ================================================
-- CLEANUP (run after verifying results)
-- ================================================
-- Uncomment to clean up all QA test data
/*
UPDATE inv.ScreenOperatingHour
SET IsDeleted = 1
WHERE ScreenId IN (
    SELECT Id FROM inv.Screen WHERE Name LIKE 'QA_%'
);

UPDATE inv.Screen
SET IsDeleted = 1
WHERE Name LIKE 'QA_%';
*/