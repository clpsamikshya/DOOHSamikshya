using Microsoft.AspNetCore.Http;

namespace DoohSamikshya.Model.Shared
{
    public class MvUploadMediaRequest
    {
        public IFormFile File { get; set; }
        public int TenantId { get; set; }
    }
}