using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.BackgroundJobs;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Shared;
using DoohSamikshya.Model.Shared.Enum;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Dbo
{
    public class CampaignService(
        IDataAccessService da,
        IBackgroundTaskQueue taskQueue) : ICampaignService
    {
        public async Task<MvCampaign> AddCampaign(MvCampaign campaign)
        {
            try
            {
                string json = JsonConvert.SerializeObject(campaign);

                string result = await da.ActionProcedure(
                    "dbo.SpCampaignIns",
                    json
                );

                var createdCampaign = JsonConvert.DeserializeObject<MvCampaign>(result);

                if (createdCampaign != null && createdCampaign.Id > 0)
                {
                    await ScheduleCampaignStatusJobs(createdCampaign);
                }

                return createdCampaign!;
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<MvCampaign> DeleteCampaign(int id)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { Id = id });

                string result = await da.ActionProcedure(
                    "dbo.SpCampaignDel",
                    json
                );

                return JsonConvert.DeserializeObject<MvCampaign>(result)!;
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<MvCampaign>?> UpdateCampaignStatus(MvCampaign campaign)
        {
            try
            {
                string json = JsonConvert.SerializeObject(campaign);

                string result = await da.ActionProcedure("dbo.SpCampaignUpd", json);

                return JsonConvert.DeserializeObject<List<MvCampaign>>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task StartCampaignAsync(int campaignId)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    Id = campaignId,
                    Status = (int)CampaignStatus.Active
                });

                await da.ActionProcedure("dbo.SpCampaignUpd", json);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task ExpireCampaignAsync(int campaignId)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    Id = campaignId,
                    Status = (int)CampaignStatus.Completed
                });

                await da.ActionProcedure("dbo.SpCampaignUpd", json);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task CheckAndUpdateAllCampaignStatusesAsync()
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { });

                await da.ActionProcedure("dbo.SpCampaignUpd", json);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task<object> GetCampaign(MvParamReqOption<MvCampaignFilter> param)
        {

            try
            {
                string json = JsonConvert.SerializeObject(param);


                string result = await da.RetrievalProcedure("dbo.SpCampaignSel", json);

                return JsonConvert.DeserializeObject<MvCampaignResponse>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }


        private async Task ScheduleCampaignStatusJobs(MvCampaign campaign)
        {
            if (campaign?.Date == null || !campaign.Date.Any())
                return;

            var currentDate = DateTimeOffset.UtcNow;
            var startDate = campaign.Date.Min(d => d.StartDateTime);
            var endDate = campaign.Date.Max(d => d.EndDateTime);

            if (startDate > currentDate && campaign.Status == CampaignStatus.New)
            {
                var delay = startDate.UtcDateTime - DateTime.UtcNow;
                var campaignId = campaign.Id;

                await taskQueue.QueueBackgroundWorkItemAsync(async token =>
                {
                    if (delay > TimeSpan.Zero)
                        await Task.Delay(delay, token);

                    if (!token.IsCancellationRequested)
                    {
                        await StartCampaignAsync(campaignId);
                    }
                });
            }

            if (endDate > currentDate)
            {
                var delay = endDate.UtcDateTime - DateTime.UtcNow;
                var campaignId = campaign.Id;

                await taskQueue.QueueBackgroundWorkItemAsync(async token =>
                {
                    if (delay > TimeSpan.Zero)
                        await Task.Delay(delay, token);


                    if (!token.IsCancellationRequested)
                    {
                        await ExpireCampaignAsync(campaignId);
                    }
                });
            }
        }
    }
}