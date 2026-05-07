using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Application.Inv;


namespace DoohSamikshya.Interface.Application.Dbo
{
    public interface ICampaignService
    {
        Task<CampaignResponse?> GetCampaign(CampaignFilter filter);
        Task<List<Campaign>> AddCampaign(Campaign campaign);
        Task<List<Campaign>?> UpdateCampaignStatus(Campaign campaign);
        Task<Campaign> DeleteCampaign(int Id);
    }
}
