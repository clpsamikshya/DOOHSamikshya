using DoohSamikshya.Model.Shared;


namespace DoohSamikshya.Interface.Shared
{
        public interface IMediaService
        {
            Task<MediaUploadResult> UploadAsync(MediaUploadParam param);
        }
    }
