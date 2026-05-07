using DoohSamikshya.Model.Application.Dbo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoohSamikshya.Interface.Application.Dbo
{
    public interface ICampaignMediaService
    {
        Task<CampaignMediaResponse?> GetCampaignMedia(CampaignMediaFilter filter);
        Task<CampaignMedia> AddCampaignMedia(CampaignMedia campaignMedia);
        Task<CampaignMedia?> UpdateCampaignMedia(CampaignMedia campaignMedia);
        Task<CampaignMedia> DeleteCampaignMedia(int id);
    }
}
