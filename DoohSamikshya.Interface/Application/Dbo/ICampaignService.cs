using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Shared;


namespace DoohSamikshya.Interface.Application.Dbo
{
    public interface ICampaignService
    {
        Task<object> GetCampaign(MvParamReqOption<MvCampaignFilter> param);

        Task<MvCampaign> AddCampaign(MvCampaign campaign);
        Task<List<MvCampaign>?> UpdateCampaignStatus(MvCampaign campaign);
        Task<MvCampaign> DeleteCampaign(int Id);

        Task StartCampaignAsync(int campaignId);
        Task ExpireCampaignAsync(int campaignId);
        Task CheckAndUpdateAllCampaignStatusesAsync();
    }


}
