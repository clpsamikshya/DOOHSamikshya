using DoohSamikshya.Model.Shared.Enum;
using Microsoft.AspNetCore.Http;

namespace DoohSamikshya.Model.Application.Media
{
    public class InsertMedia
    {
        public required IFormFile File { get; set; }

        // Set by controller after extraction — all nullable so binding never fails
        public string? Name { get; set; }
        public string? Url { get; set; }
        public string? Extension { get; set; }
        public string? Resolution { get; set; }
        public int? Duration { get; set; }
        public bool IsVideo { get; set; }
        public int TenantId { get; set; }
        public int CreatedBy { get; set; }
    }

    public class MediaFilter
    {
        public string? Search { get; set; }
        public bool? IsVideo { get; set; }
        public bool? ActiveOnly { get; set; }
        public bool? IncludeDeleted { get; set; }
        public bool? DeletedOnly { get; set; }
        public int Offset { get; set; } = 0;
        public int PageSize { get; set; } = 10;
    }

    public class MediaLibraryResponse
    {
        public int TotalRows { get; set; }   
        public List<MediaLibrary>? Data { get; set; }
    }
}