using DoohSamikshya.Model.Shared;


namespace DoohSamikshya.Interface.Shared
{
        public interface IMediaService
        {
            Task<MvMediaUploadResult> UploadAsync(MvMediaUploadParam param);
        }
    }
