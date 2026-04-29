using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Media;
using DoohSamikshya.Model.Application.Media;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Media
{
    public class MediaLibraryService(IDataAccessService da) : IMediaLibraryService
    {
        public async Task<List<MediaLibrary>> AddMediaLibrary(InsertMedia request)
        {
            // Map InsertMedia → anonymous object matching SP parameters
            var param = new
            {
                request.TenantId,
                request.Name,
                request.Url,
                request.Extension,
                request.IsVideo,
                request.Resolution,
                request.Duration,
                request.CreatedBy
            };

            string json = JsonConvert.SerializeObject(param);
            string result = await da.ActionProcedure("[dbo].[SpMediaLibraryIns]", json);

            return JsonConvert.DeserializeObject<List<MediaLibrary>>(result)
                   ?? throw new Exception("Insert failed or returned null.");
        }

        public async Task<MediaLibrary?> DeleteMediaLibrary(int id)
        {
            var payload = new
            {
                Id = id,
                tenantId = 1,
                DeletedBy = 1,
            };

           string json = JsonConvert.SerializeObject(payload);
           string result = await da.ActionProcedure("[dbo].[SpMediaLibraryDel]", json);
           return JsonConvert.DeserializeObject<MediaLibrary>(result);
        }

        public async Task<List<MediaLibrary>?> GetMediaLibrary()
        {
            string json = JsonConvert.SerializeObject(new { TenantId = 1 });
            string result = await da.RetrievalProcedure("[dbo].[SpMediaLibrarySel]", json);
            return JsonConvert.DeserializeObject<List<MediaLibrary>>(result);
        }
    }
}

//using DoohSamikshya.DataAccess;
//using DoohSamikshya.Interface.Application.Media;
//using DoohSamikshya.Model.Application.Media;
//using Newtonsoft.Json;


//namespace DoohSamikshya.Service.Application.Media
//{

//    public class MediaLibraryService(IDataAccessService da) : IMediaLibraryService
//    {
//        public async Task<MediaLibrary> AddMediaLibrary(MediaLibrary mediaLibrary)
//        {
//            string json = JsonConvert.SerializeObject(mediaLibrary);
//            string result = await da.ActionProcedure("[dbo].[SpMediaLibraryIns]", json);

//            var list = JsonConvert.DeserializeObject<List<MediaLibrary>>(result);

//            return list?.FirstOrDefault()
//                   ?? throw new Exception("Insert failed");
//        }

//        public async Task<MediaLibrary> UploadMediaAsync(int tenantId, string fileName, string contentType)
//        {
//            var media = new MediaLibrary
//            {
//                TenantId = tenantId,
//                Name = fileName,
//                Url = fileName,
//                Extension = Path.GetExtension(fileName),
//                IsVideo = contentType.StartsWith("video/"),
//                CreatedBy = 1,
//                CreatedAt = DateTimeOffset.UtcNow
//            };

//            return await AddMediaLibrary(media);
//        }


//        public async Task<MediaLibrary?> DeleteMediaLibrary(int id)
//        {
//            try
//            {
//                string json = JsonConvert.SerializeObject(new { Id = id,  });
//                string result = await da.ActionProcedure("dbo.SpMediaLibraryDel", json);
//                return JsonConvert.DeserializeObject<MediaLibrary>(result);
//            }
//            catch (Exception)
//            {
//                throw;
//            }
//        }

//        public async Task<List<MediaLibrary>?> GetMediaLibrary()
//        {
//            string json = JsonConvert.SerializeObject(new { TenantId = 1 });
//            string result = await da.RetrievalProcedure("[dbo].[SpMediaLibrarySel]", json);
//            return JsonConvert.DeserializeObject<List<MediaLibrary>>(result);
//        }


//        //public Task<List<MediaLibrary>?> DropDown()
//        //{
//        //    throw new NotImplementedException();
//        //}

//        //public async Task<List<MediaLibrary>?> GetMediaLibraryById(int Id)
//        //{
//        //    try
//        //    {
//        //        string json = JsonConvert.SerializeObject(new { Id });
//        //        string result = await da.RetrievalProcedure("[dbo].[SpMediaLibraryIns]", json);
//        //        return JsonConvert.DeserializeObject<List<MediaLibrary>>(result);
//        //    }
//        //    catch (Exception)
//        //    {
//        //        throw;
//        //    }
//        //}

//    }
//}
