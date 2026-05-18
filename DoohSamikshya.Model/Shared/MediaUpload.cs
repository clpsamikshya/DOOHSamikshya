using Microsoft.AspNetCore.Http;

namespace DoohSamikshya.Model.Shared
{
    public class MvMediaUploadParam
    {
        public IFormFile File { get; set; } = null!;
        //public int TenantId { get; set; }
        //public int CreatedBy { get; set; } = 1;
        //public bool IsVideo { get; set; }
    }

    public class MvMediaUploadResult
    {
        public string FileName { get; set; } = null!;
        public string Url { get; set; } = null!;
        public string Extension { get; set; } = null!;    // ← auto from file
        public bool IsVideo { get; set; }                 // ← auto from extension
        public int? Duration { get; set; }                // ← auto from FFmpeg
        public string Resolution { get; set; } = "1920x1080"; // ← auto from file
    }
}