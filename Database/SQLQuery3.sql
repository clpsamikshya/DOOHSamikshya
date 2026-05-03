
-- =============================================
-- Author:		Samikshya khatiwada
-- Create date: 30th april
-- Description:	Sp for deleting the screen operating hour

-- =============================================

CREATE OR ALTER PROCEDURE [inv].[SpScreenOperatingHourDel]
(
    @JSON NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @Id        INT;
        DECLARE @ScreenId  INT;
        DECLARE @DeletedBy INT;

        SELECT
            @Id        = Id,
            @ScreenId  = ScreenId,
            @DeletedBy = DeletedBy
        FROM OPENJSON(@JSON)
        WITH (
            Id        INT '$.Id',
            ScreenId  INT '$.ScreenId',
            DeletedBy INT '$.DeletedBy'
        );

        IF @Id IS NULL
            THROW 50001, 'Id is required', 1;
        IF @ScreenId IS NULL
            THROW 50002, 'ScreenId is required', 1;
        IF @DeletedBy IS NULL
            SET @DeletedBy = 1;

        IF NOT EXISTS (
            SELECT 1 FROM inv.Screen
            WHERE Id = @ScreenId AND IsDeleted = 0
        )
            THROW 50003, 'Parent screen not found or has been deleted', 1;

        IF NOT EXISTS (
            SELECT 1 FROM inv.ScreenOperatingHour
            WHERE Id = @Id AND ScreenId = @ScreenId AND IsDeleted = 0
        )
            THROW 50004, 'Operating hour not found or already deleted', 1;

        UPDATE inv.ScreenOperatingHour
        SET
            IsDeleted = 1,
            DeletedAt = SYSDATETIMEOFFSET(),
            DeletedBy = @DeletedBy,
            UpdatedAt = SYSDATETIMEOFFSET(),
            UpdatedBy = @DeletedBy
        WHERE Id      = @Id
          AND ScreenId = @ScreenId;

        SELECT @JSON =
        (
            SELECT
                @Id        AS Id,
                @ScreenId  AS ScreenId,
                @DeletedBy AS DeletedBy,
                1          AS Success,
                'Operating hour deleted successfully' AS Message
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT @JSON =
        (
            SELECT
                0               AS Success,
                ERROR_MESSAGE() AS Message
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );
        THROW;
    END CATCH
END;
