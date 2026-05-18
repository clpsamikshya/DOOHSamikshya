using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoohSamikshya.Interface.Application.Dbo
{
    public interface ICampaignMediaService
    {
        Task<MvCampaignMediaResponse> AddCampaignMedia(MvCampaignMediaRequest request);
        Task<MvCampaignMedia> DeleteCampaignMedia(int id, int deletedBy);
        //Task<CampaignMediaResponse?> GetCampaignMedia(CampaignMediaFilter filter);
        Task<object> GetCampaignMedia(MvParamReqOption<MvCampaignMediaFilter> param);
        Task<MvCampaignMediaResponse?> UpdateCampaignMedia(MvCampaignMediaRequest request);
    }
}
