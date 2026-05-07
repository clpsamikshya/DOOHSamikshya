using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Media;
using DoohSamikshya.Model.Application.Inv;
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

        //public async Task<List<MediaLibrary>?> GetMediaLibrary(MediaFilter filter)
        //{
        //    string json = JsonConvert.SerializeObject(new 
        //    { 
        //        TenantId = 1, 
        //        Search = filter.Search,
        //        IsVideo = filter.IsVideo,
        //        IncludeDeleted = filter.IncludeDeleted

        //    });
        //    string result = await da.RetrievalProcedure("[dbo].[SpMediaLibrarySel]", json);
        //    return JsonConvert.DeserializeObject<List<MediaLibrary>>(result);
        //}

        public async Task<MediaLibraryResponse?> GetMediaLibrary(MediaFilter filter)
        {
            string json = JsonConvert.SerializeObject(new
            {
                Offset = filter.Offset,
                PageSize = filter.PageSize,
                Filter = new
                {
                    Search = filter.Search ?? "",
                    Type = filter.IsVideo.HasValue ? (filter.IsVideo.Value ? 1 : 0) : (int?)null,
                    IncludeDeleted = filter.IncludeDeleted ?? false,
                    DeletedOnly = filter.DeletedOnly ?? false
                }
            });
            string result = await da.RetrievalProcedure("[dbo].[SpMediaLibrarySel]", json);
            return JsonConvert.DeserializeObject<MediaLibraryResponse>(result);
        }
    }
}
