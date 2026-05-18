using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Shared;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;


namespace DoohSamikshya.Service.Application.Dbo
{
    public class CampaignMediaService(IDataAccessService da) : ICampaignMediaService
    {

        public async Task<MvCampaignMediaResponse> AddCampaignMedia(MvCampaignMediaRequest request)
        {
            try
            {
                string json = JsonConvert.SerializeObject(request);
                string result = await da.ActionProcedure("dbo.SpCampaignMediaIns", json);
                return JsonConvert.DeserializeObject<MvCampaignMediaResponse>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }

        public async Task<MvCampaignMedia> DeleteCampaignMedia(int id, int deletedBy)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    CampaignMediaId = id,
                    DeletedBy = deletedBy
                });
                string result = await da.ActionProcedure("dbo.SpCampaignMediaDel", json);
                return JsonConvert.DeserializeObject<MvCampaignMedia>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }
        //public async Task<CampaignMediaList?> GetCampaignMedia(MvParamReqOption<CampaignFilter> param)
        //{
            
        //}

        public async Task<object> GetCampaignMedia(MvParamReqOption<MvCampaignMediaFilter> param)
        {
            try
            {
                string json = JsonConvert.SerializeObject(param);
                string result = await da.RetrievalProcedure("dbo.SpCampaignMediaSel", json);
                return JsonConvert.DeserializeObject<MvCampaignMediaList>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }

        public async Task<MvCampaignMediaResponse?> UpdateCampaignMedia(MvCampaignMediaRequest request)
        {
            try
            {
                string json = JsonConvert.SerializeObject(request);
                string result = await da.ActionProcedure("dbo.SpCampaignMediaUpd", json);
                return JsonConvert.DeserializeObject<MvCampaignMediaResponse>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }
    }
}
