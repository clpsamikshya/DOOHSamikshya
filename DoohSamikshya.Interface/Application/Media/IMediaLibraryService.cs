using DoohSamikshya.Model.Application.Media;

namespace DoohSamikshya.Interface.Application.Media
{
    public interface IMediaLibraryService
    {
        Task<List<MediaLibrary>?> GetMediaLibrary(MediaFilter filter);
        Task<List<MediaLibrary>> AddMediaLibrary(InsertMedia request);
        Task<MediaLibrary?> DeleteMediaLibrary(int id);
    }
}


