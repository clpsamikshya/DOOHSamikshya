using DoohSamikshya.Model.Application.Media;

namespace DoohSamikshya.Interface.Application.Media
{
    public interface IMediaLibraryService
    {
        Task<List<MediaLibrary>?> GetMediaLibrary();
        Task<List<MediaLibrary>> AddMediaLibrary(InsertMedia request);
        Task<MediaLibrary?> DeleteMediaLibrary(int id);
    }
}

//using DoohSamikshya.Model.Application.Media;
//using DoohSamikshya.Model.Shared;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace DoohSamikshya.Interface.Application.Media
//{

//    public interface IMediaLibraryService
//    {
//        Task<List<MediaLibrary>?> GetMediaLibrary();
//        //Task<MediaLibrary> AddMediaLibrary(MediaLibrary mediaLibrary);
//        Task<List<MediaLibrary>> AddMediaLibrary(InsertMedia request);

//        //Task<MediaUploadResult> UploadAsync(MediaUploadParam param); Task<MediaLibrary> AddMediaLibrary(MediaLibrary mediaLibrary);

//        Task<MediaLibrary?> DeleteMediaLibrary(int id);
//    }

//}
