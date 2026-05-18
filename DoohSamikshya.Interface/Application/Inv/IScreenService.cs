using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Shared;

namespace DoohSamikshya.Interface.Application.Inv
{
    public interface IScreenService
    {
        //Task<List<Screen>?> GetScreen(ScreenFilter filter);

        Task<MvScreenResponse?> GetScreen(MvParamReqOption<MvScreenFilter> param);
        Task<List<MvScreen>?> AddScreen(MvScreen screen);
        Task<List<MvScreen>?> UpdateScreen(MvScreen screen);
        Task<List<MvScreen>?> GetDropDown(int? campaignId);
        // Task<Screen?> DeleteScreen(int id);                                        
        Task<MvScreen?> DeleteScreen(int id);
        Task<string> DeleteOperatingHour(int id, int screenId, int deletedBy);     
    }
}