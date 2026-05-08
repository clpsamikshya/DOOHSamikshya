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
        Task<CampaignMediaResponse> AddCampaignMedia(CampaignMediaRequest request);
        Task<CampaignMedia> DeleteCampaignMedia(int id, int deletedBy);
        //Task<CampaignMediaResponse?> GetCampaignMedia(CampaignMediaFilter filter);
        Task<CampaignMediaList?> GetCampaignMedia(CampaignMediaFilter filter);
        Task<CampaignMediaResponse?> UpdateCampaignMedia(CampaignMediaRequest request);
    }
}
