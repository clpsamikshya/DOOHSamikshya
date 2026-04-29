namespace DoohSamikshya.API.Controllers.Application.Media
{
    public class UploadMediaRequest
    {
        public IFormFile File { get; set; }
        public int TenantId { get; set; }
    }
}

