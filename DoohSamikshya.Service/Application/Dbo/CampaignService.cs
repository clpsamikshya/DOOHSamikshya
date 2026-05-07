using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Dbo
{
    public class CampaignService(IDataAccessService da) : ICampaignService
    {
        public async Task<List<Campaign>> AddCampaign(Campaign campaign)
        {
            try
            {
                var param = new
                {
                    campaign.TenantId,
                    campaign.Name,
                    campaign.Remarks,
                    campaign.Status,
                    campaign.CreatedBy,

                };
                string json = JsonConvert.SerializeObject(param);
                string result = await da.ActionProcedure("dbo.SpCampaignIns", json);
                return JsonConvert.DeserializeObject<List<Campaign>>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<Campaign> DeleteCampaign(int Id)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { Id = Id });
                string result = await da.ActionProcedure("dbo.SpCampaignDel", json);
                return JsonConvert.DeserializeObject<Campaign>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<CampaignResponse?> GetCampaign(CampaignFilter filter)
        {
            try {
                string json = JsonConvert.SerializeObject(new
                {
                    offset = filter.Offset,
                    PageSize = filter.PageSize,
                    Filter = new
                    {
                        Search = filter.Search ?? "",
                        Status = filter.Status.HasValue ? (int?)filter.Status.Value : null,

                    }
                });
                string result = await da.RetrievalProcedure("dbo.SpCampaignSel", json);
                return JsonConvert.DeserializeObject<CampaignResponse>(result);
            }
            catch(SqlException ex)
            {
                throw new Exception(ex.Message);
            }
          }

        public async Task<List<Campaign>?> UpdateCampaignStatus(Campaign campaign)
        {
            try
            {
                string json = JsonConvert.SerializeObject(campaign);
                string result = await da.ActionProcedure("dbo.SpCampaignUpd", json);
                return JsonConvert.DeserializeObject<List<Campaign>>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
           
        }
    }
}
