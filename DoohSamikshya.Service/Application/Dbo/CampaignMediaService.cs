using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;


namespace DoohSamikshya.Service.Application.Dbo
{
    public class CampaignMediaService(IDataAccessService da) : ICampaignMediaService
    {
        //public async Task<CampaignMedia> AddCampaignMedia(CampaignMedia campaignMedia)
        //{
        //    try
        //    {
        //        string json = JsonConvert.SerializeObject(campaignMedia);
        //        string result = await da.ActionProcedure("dbo.SpCampaignMediaIns", json);
        //        return JsonConvert.DeserializeObject<CampaignMedia>(result);
        //    }
        //    catch (SqlException ex)
        //    {
        //        throw new Exception(ex.Message);
        //    }

        //}

        public async Task<CampaignMedia> AddCampaignMedia(CampaignMedia campaignMedia)
        {
            try
            {
                var payload = new
                {
                    CampaignId = campaignMedia.CampaignId,
                    ScreenId = campaignMedia.ScreenId,
                    PlayDate = campaignMedia.PlayDate,
                    CreatedBy = campaignMedia.CreatedBy,
                    Media = new[]
                    {
                new
                {
                    MediaId = campaignMedia.MediaId,
                    PlayOrder = campaignMedia.PlayOrder
                }
            }
                };

                string json = JsonConvert.SerializeObject(payload);
                string result = await da.ActionProcedure("dbo.SpCampaignMediaIns", json);
                return JsonConvert.DeserializeObject<CampaignMedia>(result);
            }
            catch (SqlException ex)
            {
                throw;
            }
        }

        public async Task<CampaignMedia> DeleteCampaignMedia(int Id)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { Id = Id });
                string result = await da.ActionProcedure("dbo.SpCampaignMediaDel", json);
                return JsonConvert.DeserializeObject<CampaignMedia>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task<CampaignMediaResponse?> GetCampaignMedia(CampaignMediaFilter filter)
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
                return JsonConvert.DeserializeObject<CampaignMediaResponse>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<CampaignMedia?> UpdateCampaignMedia(CampaignMedia campaignMedia)
        {
            try
            {
                string json = JsonConvert.SerializeObject(campaignMedia);
                string result = await da.ActionProcedure("dbo.SpCampaignMediaUpd", json);
                return JsonConvert.DeserializeObject<CampaignMedia>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
