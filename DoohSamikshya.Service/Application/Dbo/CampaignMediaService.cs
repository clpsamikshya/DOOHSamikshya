using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;


namespace DoohSamikshya.Service.Application.Dbo
{
    public class CampaignMediaService(IDataAccessService da) : ICampaignMediaService
    {

        public async Task<CampaignMediaResponse> AddCampaignMedia(CampaignMediaRequest request)
        {
            try
            {
                string json = JsonConvert.SerializeObject(request);
                string result = await da.ActionProcedure("dbo.SpCampaignMediaIns", json);
                return JsonConvert.DeserializeObject<CampaignMediaResponse>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }

        public async Task<CampaignMedia> DeleteCampaignMedia(int id, int deletedBy)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    CampaignMediaId = id,
                    DeletedBy = deletedBy
                });
                string result = await da.ActionProcedure("dbo.SpCampaignMediaDel", json);
                return JsonConvert.DeserializeObject<CampaignMedia>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task<CampaignMediaList?> GetCampaignMedia(CampaignMediaFilter filter)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    Filter = new
                    {
                        filter.CampaignId,
                        filter.ScreenId,
                        filter.PlayDate
                    },
                    filter.Offset,
                    filter.PageSize
                });
                string result = await da.RetrievalProcedure("dbo.SpCampaignMediaSel", json);
                return JsonConvert.DeserializeObject<CampaignMediaList>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }

        public async Task<CampaignMediaResponse?> UpdateCampaignMedia(CampaignMediaRequest request)
        {
            try
            {
                string json = JsonConvert.SerializeObject(request);
                string result = await da.ActionProcedure("dbo.SpCampaignMediaUpd", json);
                return JsonConvert.DeserializeObject<CampaignMediaResponse>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }
    }
}
