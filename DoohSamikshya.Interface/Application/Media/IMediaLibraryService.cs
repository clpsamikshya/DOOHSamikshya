using DoohSamikshya.Model.Application.Media;
using DoohSamikshya.Model.Shared;

namespace DoohSamikshya.Interface.Application.Media
{
    public interface IMediaLibraryService
    {
        Task<List<MvMediaLibrary>> AddMediaLibrary(MvInsertMedia request);
        Task<MvMediaLibrary?> DeleteMediaLibrary(int id);
        Task<MvMediaLibraryResponse?> GetMediaLibrary(MvParamReqOption<MvMediaFilter> param);
        Task<List<MvDropdownItem>?> GetMediaLibraryDdl(int? campaignId = null);
    }
}